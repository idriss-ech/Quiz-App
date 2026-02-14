import { useIonToast } from '@ionic/react';
import { checkmarkCircle, alertCircle } from 'ionicons/icons';

export function useToast() {
    const [present] = useIonToast();

    const showSuccess = (message: string) => {
        present({
            message: message,
            duration: 2000,
            position: 'top',
            color: 'success',
            icon: checkmarkCircle
        });
    };

    const showError = (message: string) => {
        present({
            message: message,
            duration: 3000,
            position: 'top',
            color: 'danger',
            icon: alertCircle
        });
    };

    return { showSuccess, showError };
}
