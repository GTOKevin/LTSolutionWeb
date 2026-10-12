import type { LengthUnit } from '@shared/utils/format-utils';
import {
    resolveAxleCount,
    resolveCamaUtilAplica,
    type VehicleDiagramVariant,
} from '@entities/flota/model/diagram';
import { SchematicFrame } from './diagrams/SchematicFrame';
import { formatLengthValue } from './diagrams/schematic-utils';
import { TractoSchematic } from './diagrams/TractoSchematic';
import { CarretaSchematic } from './diagrams/CarretaSchematic';
import { PlataformaSchematic } from './diagrams/PlataformaSchematic';
import { CisternaSchematic } from './diagrams/CisternaSchematic';
import { CamionetaSchematic } from './diagrams/CamionetaSchematic';
import { GenericSchematic } from './diagrams/GenericSchematic';

export interface VehicleSchematicDiagramProps {
    variant: VehicleDiagramVariant;
    tipoNombre?: string | null;
    ejes?: number | null;
    largo?: number | null;
    ancho?: number | null;
    alto?: number | null;
    camaUtil?: number | null;
    configuracionEjesCodigo?: string | null;
    configuracionEjesNombre?: string | null;
    codigoEspecifico?: string | null;
    tipoFlotaId?: number | null;
    lengthUnit?: LengthUnit;
}

/**
 * Dispatcher del esquema técnico dimensional. Selecciona el diagrama blueprint
 * según la variante resuelta del tipo de unidad y dibuja la cota de Cama Útil
 * solo cuando aplica y existe el dato.
 */
export function VehicleSchematicDiagram({
    variant,
    tipoNombre,
    ejes,
    largo,
    ancho,
    alto,
    camaUtil,
    configuracionEjesCodigo,
    configuracionEjesNombre,
    codigoEspecifico,
    tipoFlotaId,
    lengthUnit,
}: VehicleSchematicDiagramProps) {
    const axleCount = resolveAxleCount(configuracionEjesCodigo, ejes);
    const ejesLabel = axleCount > 0 ? `${axleCount} EJES` : 'EJES SIN DATO';
    const showCamaUtil = resolveCamaUtilAplica(codigoEspecifico, tipoFlotaId) && camaUtil != null;
    const camaUtilValue = showCamaUtil ? camaUtil : null;

    const frameConfig = (() => {
        switch (variant) {
            case 'TRACTO':
                return { viewBox: '0 0 860 420', minWidth: 640, maxHeight: 350, showDefaultGroundLine: false };
            case 'PLATAFORMA':
                return { viewBox: '0 0 960 380', minWidth: 680, maxHeight: 330, showDefaultGroundLine: false };
            case 'CISTERNA':
                return { viewBox: '0 0 1020 420', minWidth: 720, maxHeight: 350, showDefaultGroundLine: false };
            case 'CAMA_BAJA':
            case 'CAMA_CUNA':
            default:
                return { viewBox: '0 0 600 160', minWidth: 480, maxHeight: 180, showDefaultGroundLine: true };
        }
    })();

    const renderVariant = () => {
        switch (variant) {
            case 'TRACTO':
                return (
                    <TractoSchematic
                        largo={largo}
                        alto={alto}
                        ejes={ejes}
                        configuracionEjesCodigo={configuracionEjesCodigo}
                        configuracionEjesNombre={configuracionEjesNombre}
                        lengthUnit={lengthUnit}
                    />
                );
            case 'CAMA_BAJA':
            case 'CAMA_CUNA':
                return (
                    <CarretaSchematic
                        label={variant === 'CAMA_CUNA' ? 'CAMA CUNA' : 'CAMA BAJA'}
                        largo={largo}
                        alto={alto}
                        ejes={ejes}
                        camaUtil={camaUtilValue}
                        lengthUnit={lengthUnit}
                    />
                );
            case 'PLATAFORMA':
                return (
                    <PlataformaSchematic
                        largo={largo}
                        alto={alto}
                        ejes={ejes}
                        camaUtil={camaUtilValue}
                        lengthUnit={lengthUnit}
                    />
                );
            case 'CISTERNA':
                return (
                    <CisternaSchematic largo={largo} alto={alto} ejes={ejes} lengthUnit={lengthUnit} />
                );
            case 'CAMIONETA':
                return <CamionetaSchematic largo={largo} alto={alto} lengthUnit={lengthUnit} />;
            default:
                return (
                    <GenericSchematic
                        largo={largo}
                        alto={alto}
                        ejes={ejes}
                        camaUtil={camaUtilValue}
                        configuracionEjesCodigo={configuracionEjesCodigo}
                        lengthUnit={lengthUnit}
                    />
                );
        }
    };

    return (
        <SchematicFrame
            tipoNombre={tipoNombre}
            ejesLabel={ejesLabel}
            anchoLabel={formatLengthValue(ancho, lengthUnit)}
            altoLabel={formatLengthValue(alto, lengthUnit)}
            viewBox={frameConfig.viewBox}
            minWidth={frameConfig.minWidth}
            maxHeight={frameConfig.maxHeight}
            showDefaultGroundLine={frameConfig.showDefaultGroundLine}
        >
            {renderVariant()}
        </SchematicFrame>
    );
}
