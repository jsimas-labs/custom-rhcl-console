import { __rest } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Breadcrumb, BreadcrumbItem, Content, Nav, NavItem, NavList, Page, PageSection, PageSidebar, PageSidebarBody, SkipToContent } from '@patternfly/react-core';
import { DashboardHeader } from './DashboardHeader';
export const DashboardBreadcrumb = (_jsxs(Breadcrumb, { children: [_jsx(BreadcrumbItem, { children: "Section home" }), _jsx(BreadcrumbItem, { to: "#", children: "Section title" }), _jsx(BreadcrumbItem, { to: "#", children: "Section title" }), _jsx(BreadcrumbItem, { to: "#", isActive: true, children: "Section landing" })] }));
const PageTemplateTitle = (_jsx(PageSection, { "aria-labelledby": "main-title", children: _jsxs(Content, { children: [_jsx("h1", { id: "main-title", children: "Main title" }), _jsx("p", { children: "This is a full page demo." })] }) }));
export const DashboardWrapper = (_a) => {
    var { children, mainContainerId, breadcrumb, masthead, sidebar, sidebarNavOpen, onPageResize, hasDefaultBreadcrumb, notificationDrawer, isNotificationDrawerExpanded, hasPageTemplateTitle } = _a, pageProps = __rest(_a, ["children", "mainContainerId", "breadcrumb", "masthead", "sidebar", "sidebarNavOpen", "onPageResize", "hasDefaultBreadcrumb", "notificationDrawer", "isNotificationDrawerExpanded", "hasPageTemplateTitle"]);
    const [activeItem, setActiveItem] = useState(1);
    const onNavSelect = (_event, result) => {
        setActiveItem(result.itemId);
    };
    let renderedBreadcrumb;
    if (!hasDefaultBreadcrumb) {
        renderedBreadcrumb = breadcrumb !== null && breadcrumb !== void 0 ? breadcrumb : DashboardBreadcrumb;
    }
    const PageNav = (_jsx(Nav, { onSelect: onNavSelect, "aria-label": "Nav", children: _jsxs(NavList, { children: [_jsx(NavItem, { itemId: 0, isActive: activeItem === 0, to: "#system-panel", children: "System panel" }), _jsx(NavItem, { itemId: 1, isActive: activeItem === 1, to: "#policy", children: "Policy" }), _jsx(NavItem, { itemId: 2, isActive: activeItem === 2, to: "#auth", children: "Authentication" }), _jsx(NavItem, { itemId: 3, isActive: activeItem === 3, to: "#network", children: "Network services" }), _jsx(NavItem, { itemId: 4, isActive: activeItem === 4, to: "#server", children: "Server" })] }) }));
    const _sidebar = (_jsx(PageSidebar, { isSidebarOpen: sidebarNavOpen || false, children: _jsx(PageSidebarBody, { children: PageNav }) }));
    const handleClick = (event) => {
        event.preventDefault();
        const mainContentElement = document.getElementById(mainContainerId !== null && mainContainerId !== void 0 ? mainContainerId : 'main-content-page-layout-default-nav');
        if (mainContentElement) {
            mainContentElement.focus();
        }
    };
    const PageSkipToContent = (_jsx(SkipToContent, { onClick: handleClick, href: `#${mainContainerId !== null && mainContainerId !== void 0 ? mainContainerId : 'main-content-page-layout-default-nav'}`, children: "Skip to content" }));
    return (_jsxs(Page, Object.assign({ masthead: masthead !== null && masthead !== void 0 ? masthead : _jsx(DashboardHeader, {}), sidebar: sidebar !== null && sidebar !== void 0 ? sidebar : _sidebar, isManagedSidebar: true, skipToContent: PageSkipToContent, breadcrumb: renderedBreadcrumb, mainContainerId: mainContainerId !== null && mainContainerId !== void 0 ? mainContainerId : 'main-content-page-layout-default-nav', notificationDrawer: notificationDrawer, isNotificationDrawerExpanded: isNotificationDrawerExpanded }, (typeof onPageResize === 'function' && {
        onPageResize: (event, resizeObject) => onPageResize(event, resizeObject)
    }), pageProps, { children: [hasPageTemplateTitle && PageTemplateTitle, children] })));
};
DashboardWrapper.displayName = 'DashboardWrapper';
//# sourceMappingURL=DashboardWrapper.js.map