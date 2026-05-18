"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Store as StoreIcon,
  AddCircle as CreateIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Info as LearnIcon,
  BugReport as BugIcon,
  Groups as PeopleIcon,
} from "@mui/icons-material";

import ConnectWallet from "./ConnectWallet";
import WalletAddress from "./WalletAddress";
import NetworkSwitcher from "./NetworkSwitcher";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

export const Navigation: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const navLinks = [

    { href: "/marketplace", label: "Marketplace", icon: <StoreIcon /> },
    { href: "/create", label: "Create Agent", icon: <CreateIcon /> },
    { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { href: "/dashboard/referrals", label: "Affiliate", icon: <PeopleIcon /> },
    { href: "/analytics", label: "Analytics", icon: <AnalyticsIcon /> },
    { href: "/telemetry", label: "Telemetry", icon: <AnalyticsIcon /> },
    { href: "/security", label: "Security", icon: <SecurityIcon /> },
    { href: "/provenance", label: "Provenance", icon: <SecurityIcon /> },
    { href: "/portfolio", label: "Portfolio", icon: <DashboardIcon /> },
    { href: "/waitlist", label: "Waitlist", icon: <HomeIcon /> },
    { href: "/staking", label: "Staking", icon: <StoreIcon /> },
    { href: "/learn", label: "Learn", icon: <LearnIcon /> },
    { href: "/bug-report", label: "Report Bug", icon: <BugIcon /> },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/create", label: "Create Agent" },
    { href: "/trading", label: "Trading" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/analytics", label: "Analytics" },
    { href: "/telemetry", label: "Telemetry" },
    { href: "/security", label: "Security" },
    { href: "/provenance", label: "Provenance" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/waitlist", label: "Waitlist" },
    { href: "/staking", label: "Staking" },
    { href: "/learn", label: "Learn" },
    { href: "/bug-report", label: "Report Bug" },
    { href: "/bug-reports", label: "Bug Reports" },
    { href: "submissions", label: "Submission Dashboard" },

  ];

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setIsDrawerOpen(open);
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-cosmic-dark/80 border-b border-cosmic-purple/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-smooth"
          >
            <span className="text-2xl text-cosmic-purple font-bold">*</span>
            <span className="glow-text font-bold text-xl tracking-tight">stellAIverse</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center">
            {navLinks.slice(0, 5).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-cosmic-purple transition-smooth relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cosmic-purple transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex gap-3 items-center">
            <div className="hidden md:flex gap-3 items-center">
              <ThemeToggle />
              <LanguageSwitcher />
              <NetworkSwitcher />
              <ConnectWallet />
              <WalletAddress />
            </div>

            {/* Mobile Menu Button */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              className="md:hidden"
              sx={{
                ml: 2,
                color: "white",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              <MenuIcon />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: "280px",
            backgroundColor: "#0f0f23",
            backgroundImage: "linear-gradient(180deg, #1a1a2e 0%, #0f0f23 100%)",
            color: "white",
            borderLeft: "1px solid rgba(139, 92, 246, 0.2)",
          },
        }}
      >
        <Box
          sx={{ width: "auto", p: 2 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box className="flex justify-between items-center mb-6">
            <span className="glow-text font-bold text-lg">Navigation</span>
            <IconButton onClick={toggleDrawer(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List sx={{ mb: 4 }}>
            {navLinks.map((link) => (
              <ListItem key={link.href} disablePadding>
                <Link href={link.href} passHref style={{ width: "100%", textDecoration: "none", color: "inherit" }}>
                  <ListItemButton
                    sx={{
                      borderRadius: "8px",
                      mb: 1,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Box sx={{ mr: 2, color: "inherit", opacity: 0.8 }}>{link.icon}</Box>
                    <ListItemText primary={link.label} />
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
          </List>

          <Box sx={{ pt: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <Box className="flex flex-col gap-4 mt-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-sm text-gray-400">Appearance</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-sm text-gray-400">Language</span>
                <LanguageSwitcher />
              </div>
              <Box sx={{ mt: 2 }}>
                <NetworkSwitcher className="w-full mb-3" />
                <ConnectWallet className="w-full mb-3" />
                <WalletAddress />
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </nav>
  );
};

export default Navigation;
