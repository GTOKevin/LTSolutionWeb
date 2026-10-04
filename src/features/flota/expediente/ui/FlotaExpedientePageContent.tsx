import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { APP_PATHS } from '@shared/config/app-routes';
import { flotaApi } from '@entities/flota/api/flota.api';
import { useFlotaReports } from '@features/flota/reports/hooks/useFlotaReports';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';
import { CrudTabbedPageShell } from '@shared/components/ui/CrudTabbedPageShell';
import { TabPanel } from '@shared/components/ui/TabPanel';
import { LoadingModal } from '@shared/components/ui/LoadingModal';
import { FlotaFichaTab } from './tabs/FlotaFichaTab';
import { FlotaHistorialViajesTab } from './tabs/FlotaHistorialViajesTab';
import { FlotaTallerTab } from './tabs/FlotaTallerTab';
import { FlotaDocumentosList } from '../../documentos/ui/FlotaDocumentosList';
import { PERMISSIONS } from '@shared/constants/permissions';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { buildCodigoInterno } from '@entities/flota/model/constants';

export function FlotaExpedientePageContent() {
    const navigate = useNavigate();
    const { id } = useParams();
    const flotaId = Number(id);
    const isValidId = Number.isFinite(flotaId) && flotaId > 0;
    const canManageFlotas = usePermission(PERMISSIONS.FLOTA.GESTIONAR);
    const [activeTab, setActiveTab] = useState(0);
    const { handleDownloadFicha, loadingMessage } = useFlotaReports();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.expediente(flotaId),
        queryFn: () => flotaApi.getExpediente(flotaId),
        enabled: isValidId,
    });

    const documentosCount = data?.documentos.length ?? 0;
    const viajesCount = data?.viajes.total ?? 0;
    const tallerCount = data?.taller.totalOrdenes ?? 0;

    const tabs = [
        { label: 'Ficha Técnica & Balanza' },
        { label: `Legajo Documental (${documentosCount})` },
        { label: `Historial de Viajes (${viajesCount})` },
        { label: `Historial de Taller (${tallerCount})` },
    ];

    const title = data ? `Expediente ${data.flota.placa}` : 'Expediente de Unidad';
    const subtitle = data
        ? `${data.flota.codigoInterno ?? buildCodigoInterno(data.flota.tipoFlota, data.flota.flotaID)} · ${data.flota.tipoFlotaNavigation?.nombre ?? ''} · ${data.flota.marca ?? ''} ${data.flota.modelo ?? ''}`
        : 'Ficha técnica, legajo documental e historial de la unidad';
    const loadErrorMessage = !isValidId
        ? 'Identificador de unidad inválido.'
        : isError
            ? 'No se pudo cargar el expediente de la unidad. Reintente la consulta o vuelva al listado.'
            : null;

    return (
        <>
            <CrudTabbedPageShell
                title={title}
                subtitle={subtitle}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(_, value) => setActiveTab(value)}
                loading={isValidId && isLoading}
                errorMessage={loadErrorMessage}
                footer={(
                    <>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => navigate(APP_PATHS.flotas)}
                        >
                            Volver al listado
                        </Button>

                        {loadErrorMessage ? (
                            <Button variant="outlined" onClick={() => refetch()}>
                                Reintentar
                            </Button>
                        ) : null}

                        {data ? (
                            <Button
                                variant="outlined"
                                onClick={() => handleDownloadFicha(flotaId, data.flota.placa)}
                            >
                                Ficha Técnica (PDF)
                            </Button>
                        ) : null}

                        {data && canManageFlotas ? (
                            <Button
                                variant="contained"
                                onClick={() => navigate(`${APP_PATHS.flotas}/${flotaId}`)}
                            >
                                Editar Especificaciones
                            </Button>
                        ) : null}
                    </>
                )}
            >
                {data ? (
                    <>
                        <TabPanel value={activeTab} index={0} name="expediente">
                            <FlotaFichaTab expediente={data} />
                        </TabPanel>
                        <TabPanel value={activeTab} index={1} name="expediente">
                            <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
                                <FlotaDocumentosList flotaId={flotaId} viewOnly={!canManageFlotas} />
                            </Box>
                        </TabPanel>
                        <TabPanel value={activeTab} index={2} name="expediente">
                            <FlotaHistorialViajesTab flotaId={flotaId} />
                        </TabPanel>
                        <TabPanel value={activeTab} index={3} name="expediente">
                            <FlotaTallerTab flotaId={flotaId} resumen={data.taller} />
                        </TabPanel>
                    </>
                ) : null}
            </CrudTabbedPageShell>

            <LoadingModal open={Boolean(loadingMessage)} message={loadingMessage ?? undefined} />
        </>
    );
}
