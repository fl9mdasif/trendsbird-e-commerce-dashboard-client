// import { DrawerItem, UserRole } from "@/types";

// //icons
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import GroupIcon from "@mui/icons-material/Group";
// import { USER_ROLE } from "@/contains/role";
// import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
// import PetsIcon from "@mui/icons-material/Pets";
// import ChecklistIcon from "@mui/icons-material/Checklist";
// import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import KeyIcon from "@mui/icons-material/Key";

// export const drawerItems = (role: UserRole): DrawerItem[] => {
//   const roleMenus: DrawerItem[] = [];

//   switch (role) {
//     case USER_ROLE.ADMIN:
//       roleMenus.push(
//         {
//           title: "Dashboard",
//           path: `${role}`,
//           icon: DashboardIcon,
//         },
//         {
//           title: "Projects",
//           path: `${role}/projects`,
//           icon: PlaylistAddIcon,
//         },
//         {
//           title: "All Pets",
//           path: `${role}/all-pets`,
//           icon: PetsIcon,
//         },
//         {
//           title: "Adoptions",
//           path: `${role}/adoptions`,
//           icon: ChecklistIcon,
//         },
//         {
//           title: "All Users",
//           path: `${role}/user-management`,
//           icon: GroupIcon,
//         },
//         {
//           title: "My Profile",
//           path: `${role}/profile-management`,
//           icon: AccountCircleIcon,
//         }
//       );
//       break;

//     default:
//       break;
//   }

//   return [...roleMenus];
// };
