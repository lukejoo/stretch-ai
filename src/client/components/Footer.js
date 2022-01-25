import { Box, Typography } from "@mui/material";
import Link from "@mui/material/Link";

const Footer = () => {
	return (
		<Box sx={{ bgcolor: "background.paper", pb: 2 }} component="footer">
			<Typography variant="subtitle1">Stretch.AI</Typography>
			<Typography variant="subtitle2" color="text.secondary">
				Stack-a-thon project for Fullstack Academy
			</Typography>
			<Typography variant="body2" color="text.secondary" align="center">
				{"Copyright © "}
				<Link color="inherit" href="https://www.linkedin.com/in/lukejoo/">
					Luke Joo
				</Link>{" "}
				{new Date().getFullYear()}
				{"."}
			</Typography>
		</Box>
	);
};

export default Footer;
