import { ProfilePageContent, useProfilePageController } from '@features/profile';

export function PerfilPage() {
    const controller = useProfilePageController();

    return <ProfilePageContent controller={controller} />;
}
