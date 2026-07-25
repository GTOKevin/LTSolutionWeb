import { useProfilePageController } from '@features/profile';
import { ProfileView } from '@widgets/profile';

export function PerfilPage() {
    const controller = useProfilePageController();

    return (
        <ProfileView
            data={controller.data}
            isLoading={controller.isLoading}
            isFetching={controller.isFetching}
            isError={controller.isError}
            onRetry={() => {
                void controller.refetch();
            }}
        />
    );
}
