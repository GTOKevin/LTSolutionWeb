import { alpha, type Theme } from '@mui/material';


export const getStatusStyles = (theme: Theme, active: boolean) => {
    return active
        ? {
              bg: alpha(theme.palette.success.main, 0.1),
              text: theme.palette.success.dark,
              border: alpha(theme.palette.success.main, 0.2)
          }
        : {
              bg: alpha(theme.palette.error.main, 0.1),
              text: theme.palette.error.dark,
              border: alpha(theme.palette.error.main, 0.2)
          };
};
