import {createTheme} from '@mui/material/styles';
import {responsiveFontSizes} from "@mui/material";
import {itIT} from "@mui/material/locale";

// A custom theme for this app
const theme = responsiveFontSizes(createTheme({
        // palette: {
        //     primary: {
        //         main: '#4B95A2',
        //     },
        // },
        typography: {
            // fontFamily: [
            //     'Inter',
            //     'sans-serif',
            // ].join(','),
            color: '#333333',
        },
        components: {

        },
    },
    itIT,
));

export default theme;
