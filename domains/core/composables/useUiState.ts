export const useUiState = () => {
  const wishlistSidebarIsOpen = useState('wishlistSidebarIsOpen', () => false);
  const toggleWishlistSideBar = () => (wishlistSidebarIsOpen.value = !wishlistSidebarIsOpen.value);

  return {
    wishlistSidebarIsOpen,
    toggleWishlistSideBar,
  };
};
