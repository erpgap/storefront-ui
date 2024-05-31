export const useUiState = () => {
  const wishlistSidebarIsOpen = useState("wishlistSidebarIsOpen", () => false);
  const toggleWishlistSideBar = useToggle(wishlistSidebarIsOpen);

  return {
    wishlistSidebarIsOpen,
    toggleWishlistSideBar,
  };
};
