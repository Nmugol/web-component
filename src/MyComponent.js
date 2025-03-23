import React, { useEffect, useState } from "react";
import r2wc from "@r2wc/react-to-web-component";
import { AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Collapse, Typography, Button, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";

const Navigation = ({ isAuthenticated }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuLinks, setMenuLinks] = useState([]);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const response = await fetch("https://unispace.pbs.edu.pl/api/cms/menu/slug/menu-glowne");
      
      if (!response.ok) throw new Error("Nie udało się pobrać danych.");
      
      const data = await response.json();
      
      if (Array.isArray(data.menuItems)) setMenuLinks(data.menuItems);
      
      else throw new Error("Brak menuItems w odpowiedzi.");
    } 
    catch (error){
      setError(error.message);
    }
  };

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  const handleSubmenuToggle = (path) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const renderMenu = (items, parentPath = "") => (
    <List>
      {items.map((item, index) => {
        const currentPath = `${parentPath}${index}`;
        return (
          <React.Fragment key={currentPath}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => item.children?.length > 0 && handleSubmenuToggle(currentPath)}>
                <ListItemText primary={item.name} sx={{ whiteSpace: "nowrap" }} />
                {item.children?.length > 0 ? (
                  expandedMenus[currentPath] ? <ExpandLess /> : <ExpandMore />
                ) : null}
              </ListItemButton>
            </ListItem>
            {item.children?.length > 0 && (
              <Collapse in={expandedMenus[currentPath]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 4 }}>
                  {renderMenu(item.children, `${currentPath}-`)}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        );
      })}
    </List>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ width: "100vw", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My App
          </Typography>
          {isAuthenticated ? <Button color="inherit">Logout</Button> : <Button color="inherit">Login</Button>}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? 250 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? 250 : 0,
            transition: 'width 0.3s',
            overflowX: 'hidden',
            marginTop: "64px", // Aby Drawer był pod AppBar
            
          },
        }}
      >

        {renderMenu(menuLinks)}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: "64px" }}>
        {error && <Typography color="error">Błąd: {error}</Typography>}
      </Box>
    </Box>
  );
};

const NavigationWebComponent = r2wc(Navigation, { props: { isAuthenticated: "string" } });
customElements.define("navigation-web", NavigationWebComponent);
