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
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    fetchMenuData();
    fetchUserData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const response = await fetch("https://unispace.pbs.edu.pl/api/cms/menu/slug/menu-glowne");
      if (!response.ok) throw new Error("Nie udało się pobrać danych.");
      const data = await response.json();
      if (Array.isArray(data.menuItems)) setMenuLinks(data.menuItems);
      else throw new Error("Brak menuItems w odpowiedzi.");
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch("/userData.json");
      if (!response.ok) throw new Error("Nie udało się pobrać danych użytkownika.");
      const data = await response.json();
      setUserData(data);
    } catch (error) {
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

const renderMenu = (items, parentPath = "") => {
  const filteredItems = items.filter((item) => {
    const isUserLoggedIn = userData?.loggedIn;
    const userIsEmployee = userData?.data?.flagapracownik === "1";
    const userIsStudent = userData?.data?.flagastudent === "1";
    
    // Nowe sprawdzanie uprawnień w "resource_access"
    const userPermissions = userData?.data?.resource_access || {}; // Pobieramy wszystkie sekcje
    const hasPermission = (permissionList) => {
      if (!permissionList) return true; // Jeśli brak ról, to pozwól na dostęp
      return permissionList.some(permission => {
        const [resource, role] = permission.split(':'); // Dzielimy rolę na resource i rolę
        return userPermissions[resource] && userPermissions[resource].includes(role); // Sprawdzamy, czy rola jest przypisana w danym zasobie
      });
    };

const showMenuItem = (
  (!item.requiredLoggedIn || isUserLoggedIn) &&
  (
    // Sprawdzenie dla konkretnego elementu
    (item.name === "Księga identyfikacji wizualnej" ? (
      // Jeśli nazwa to "Księga identyfikacji wizualnej", sprawdzamy flagi pracownika i studenta
      (item.employeeFlag === null || item.employeeFlag.includes(Number(userData?.data?.flagapracownik))) ||
      (item.studentFlag === null || item.studentFlag.includes(Number(userData?.data?.flagastudent)))
    ) : (
      // Dla innych elementów menu, sprawdzamy obie flagi
      (item.employeeFlag === null || item.employeeFlag.includes(Number(userData?.data?.flagapracownik))) &&
      (item.studentFlag === null || item.studentFlag.includes(Number(userData?.data?.flagastudent)))
    ))
  ) &&
  hasPermission(item.permission)
);


    if (!showMenuItem) return false;

    const hasVisibleChildren = item.children?.some(child =>
      (!child.requiredLoggedIn || isUserLoggedIn) &&
      (child.employeeFlag === null || child.employeeFlag.includes(Number(userData?.data?.flagapracownik))) && 
      (child.studentFlag === null || child.studentFlag === userIsStudent) &&
      hasPermission(child.permission)
    );

    // Upewnij się, że element i jego dzieci są widoczne
    return hasVisibleChildren || item.url;
  });

  if (filteredItems.length === 0) return null;

  return (
    <List>
      {filteredItems.map((item, index) => {
        const currentPath = `${parentPath}${index}`;
        const hasChildren = item.children?.length > 0;

        return (
          <React.Fragment key={currentPath}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => item.children?.length > 0 && handleSubmenuToggle(currentPath)}>
                <ListItemText
                  primary={
                    item.url ? (
                      <a href={item.url} className="MuiTypography-root MuiTypography-body1 MuiListItemText-primary css-fyswvn" style={{ textDecoration: "none", color: "inherit" }}>
                        {item.name}
                      </a>
                    ) : (
                      item.name
                    )
                  }
                />
                {hasChildren ? (expandedMenus[currentPath] ? <ExpandLess /> : <ExpandMore />) : null}
              </ListItemButton>
            </ListItem>
            {hasChildren && (
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
};

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
        open={drawerOpen}
        sx={{
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            marginTop: "64px",
            width: "300px",
            height: "calc(100vh - 64px)", // Pełna wysokość ekranu minus wysokość nagłówka
            overflowY: "auto", // Włącz przewijanie pionowe
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", padding: "10px" }} />
        {renderMenu(menuLinks)}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 1, marginTop: "64px" }}>
        {error && <Typography color="error">Błąd: {error}</Typography>}
      </Box>
    </Box>
  );
};

const NavigationWebComponent = r2wc(Navigation, { props: { isAuthenticated: "string" } });
customElements.define("navigation-web", NavigationWebComponent);
