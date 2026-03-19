export const logger = {
    error: (message: string, ...optionalParams: any[]) => {
        if (import.meta.env.DEV) {
            console.error(message, ...optionalParams);
        }
    },
    warn: (message: string, ...optionalParams: any[]) => {
        if (import.meta.env.DEV) {
            console.warn(message, ...optionalParams);
        }
    },
    info: (message: string, ...optionalParams: any[]) => {
        if (import.meta.env.DEV) {
            console.info(message, ...optionalParams);
        }
    },
    log: (message: string, ...optionalParams: any[]) => {
        if (import.meta.env.DEV) {
            console.log(message, ...optionalParams);
        }
    }
};
