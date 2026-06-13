export const useCartUiState = () => {
  const cartSidebarIsOpen = useState('cartSidebarIsOpen', () => false)
  const toggleCartSideBar = useToggle(cartSidebarIsOpen)
  const openCartSideBar = () => { cartSidebarIsOpen.value = true }
  const closeCartSideBar = () => { cartSidebarIsOpen.value = false }

  return {
    cartSidebarIsOpen,
    toggleCartSideBar,
    openCartSideBar,
    closeCartSideBar,
  }
}
