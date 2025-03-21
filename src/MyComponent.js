import React, { useEffect, useState } from "react";
import r2wc from "@r2wc/react-to-web-component";

const Navigation = () => {
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

  const toggleDrawer = (open) => setDrawerOpen(open);

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

    const hasPermission = item.permission ? item.permission.includes(userData?.data?.permission) : true;
    const showMenuItem = (
      (!item.requiredLoggedIn || isUserLoggedIn) &&
      (item.employeeFlag === null || item.employeeFlag === userIsEmployee) &&
      (item.studentFlag === null || item.studentFlag === userIsStudent) &&
      hasPermission
    );

    if (!showMenuItem) return false;

    // Czy są dzieci, które powinny być wyświetlone?
    const hasVisibleChildren = item.children?.some(child =>
      (!child.requiredLoggedIn || isUserLoggedIn) &&
      (child.employeeFlag === null || child.employeeFlag === userIsEmployee) &&
      (child.studentFlag === null || child.studentFlag === userIsStudent) &&
      (child.permission ? child.permission.includes(userData?.data?.permission) : true)
    );

    // Jeśli nie ma widocznych dzieci i to "Pełnomocnictwa" → usuń
    return hasVisibleChildren || item.url; 
  });

  if (filteredItems.length === 0) return null;

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {filteredItems.map((item, index) => {
        const currentPath = `${parentPath}${index}`;
        const hasChildren = item.children?.length > 0;

        return (
          <li key={currentPath}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a href={item.url} style={{ fontSize: "18px", textDecoration: "none" }}>{item.name}</a>
              {hasChildren && (
                <button onClick={() => handleSubmenuToggle(currentPath)} style={{ fontSize: "18px" }}>
                  {expandedMenus[currentPath] ? "▲" : "▼"}
                </button>
              )}
            </div>
            {hasChildren && expandedMenus[currentPath] && (
              <div style={{ paddingLeft: "20px" }}>
                {renderMenu(item.children, `${currentPath}-`)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};



  return (
    <div>
      <header style={{ backgroundColor: "#3f51b5", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => toggleDrawer(true)} style={{ fontSize: "16px", color: "white" }}>Menu</button>
        <h1 style={{ color: "white" }}>My App</h1>
        {userData?.loggedIn ? (
          <button style={{ fontSize: "16px" }}>Logout</button>
        ) : (
          <button style={{ fontSize: "16px" }}>Login</button>
        )}
      </header>

      {error && <div style={{ color: "red", padding: "10px" }}>Błąd: {error}</div>}

      {drawerOpen && (
        <nav style={{ position: "fixed", top: 0, left: 0, width: "250px", height: "100%", backgroundColor: "#fff", boxShadow: "2px 0 5px rgba(0, 0, 0, 0.3)", padding: "20px", zIndex: 100 }}>
          <button onClick={() => toggleDrawer(false)} style={{ fontSize: "20px", position: "absolute", top: "10px", right: "10px" }}>Close</button>
          {renderMenu(menuLinks)}
        </nav>
      )}
    </div>
  );
};

// Konwersja do Web Component
const NavigationWebComponent = r2wc(Navigation, { props: { isAuthenticated: "string" } });
customElements.define("navigation-web", NavigationWebComponent);
