import { loginRoute } from '~~/app/utils/authRedirect'

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, hasValidSession, clearUser } = useAuth()

  if (!isAuthenticated.value) {
    return navigateTo(loginRoute(to.fullPath))
  }

  if (!(await hasValidSession())) {
    clearUser()
    return navigateTo(loginRoute(to.fullPath, true))
  }
})
