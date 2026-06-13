export const useWishlistUiState = () => {
  const wishlistSidebarIsOpen = useState('wishlistSidebarIsOpen', () => false)
  const toggleWishlistSideBar = useToggle(wishlistSidebarIsOpen)
  const closeWishlistSideBar = () => { wishlistSidebarIsOpen.value = false }

  return {
    wishlistSidebarIsOpen,
    toggleWishlistSideBar,
    closeWishlistSideBar,
  }
}
