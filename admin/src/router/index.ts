import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      redirect: '/ventas'
    },
    {
      path: '/stats',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: { title: 'Inicio' },
    },
    {
      path: '/usuarios',
      name: 'Usuarios',
      component: () => import('../views/UsersView.vue'),
      meta: {
        title: 'Usuarios',
      },
    },
    {
      path: '/clientes',
      name: 'Clientes',
      component: () => import('../views/ClientsView.vue'),
      meta: {
        title: 'Clientes',
      },
    },
    {
      path: '/clientes/nuevo',
      name: 'Nuevo Cliente',
      component: () => import('../views/ClientFormView.vue'),
      meta: {
        title: 'Nuevo Cliente',
      },
    },
    {
      path: '/clientes/:id/editar',
      name: 'Editar Cliente',
      component: () => import('../views/ClientFormView.vue'),
      meta: {
        title: 'Editar Cliente',
      },
    },
    {
      path: '/clientes/:id/ver',
      name: 'Ver Cliente',
      component: () => import('../views/ClientFormView.vue'),
      meta: {
        title: 'Ver Cliente',
      },
    },
    {
      path: '/usuarios/nuevo',
      name: 'Nuevo Usuario',
      component: () => import('../views/UserFormView.vue'),
      meta: {
        title: 'Nuevo Usuario',
      },
    },
    {
      path: '/usuarios/:id/editar',
      name: 'Editar Usuario',
      component: () => import('../views/UserFormView.vue'),
      meta: {
        title: 'Editar Usuario',
      },
    },
    {
      path: '/usuarios/:id/ver',
      name: 'Ver Usuario',
      component: () => import('../views/UserFormView.vue'),
      meta: {
        title: 'Ver Usuario',
      },
    },
    {
      path: '/compras',
      name: 'Compras',
      component: () => import('../views/PurchasesView.vue'),
      meta: {
        title: 'Compras',
      },
    },
    {
      path: '/compras/nueva',
      name: 'Nueva Compra',
      component: () => import('../views/PurchaseFormView.vue'),
      meta: {
        title: 'Nueva Compra',
      },
    },
    {
      path: '/compras/:id/desglose',
      name: 'Desglose de Compra',
      component: () => import('../views/PurchaseBreakdownView.vue'),
      meta: {
        title: 'Desglose de Compra',
      },
    },
    {
      path: '/inventario',
      name: 'Inventario',
      component: () => import('../views/InventoryView.vue'),
      meta: {
        title: 'Inventario',
      },
    },
    {
      path: '/inventario/nuevo',
      name: 'Nuevo Producto',
      component: () => import('../views/InventoryFormView.vue'),
      meta: {
        title: 'Nuevo Producto',
      },
    },
    {
      path: '/ventas',
      name: 'Ventas',
      component: () => import('../views/SalesView.vue'),
      meta: {
        title: 'Ventas',
      },
    },
    {
      path: '/ventas/nueva',
      name: 'Nueva Venta',
      component: () => import('../views/SalesFormView.vue'),
      meta: {
        title: 'Nueva Venta',
      },
    },
    {
      path: '/cuentas',
      name: 'Cuentas',
      component: () => import('../views/CuentasView.vue'),
      meta: {
        title: 'Cuentas',
      },
    },
    {
      path: '/presupuesto',
      name: 'Presupuesto',
      component: () => import('../views/PresupuestoView.vue'),
      meta: {
        title: 'Presupuesto',
      },
    },
    {
      path: '/presupuesto/nuevo',
      name: 'Nuevo Presupuesto',
      component: () => import('../views/PresupuestoFormView.vue'),
      meta: {
        title: 'Nuevo Presupuesto',
      },
    },
    {
      path: '/cuentas/:id',
      name: 'Detalle de Cuenta',
      component: () => import('../views/CuentaDetailView.vue'),
      meta: {
        title: 'Detalle de Cuenta',
      },
    },
    {
      path: '/reportes',
      name: 'Reportes',
      component: () => import('../views/ReportsView.vue'),
      meta: {
        title: 'Reportes',
      },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
      },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
      },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
      },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
    },
    {
      path: '/bar-chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },

    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Signup',
      },
    },
  ],
})

export default router

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/signin', '/signup']

router.beforeEach((to, _from, next) => {
  document.title = `Ferremania | ${to.meta.title || 'Admin'}`

  const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isAuthenticated = !!rawUser
  const isPublic = PUBLIC_ROUTES.includes(to.path)
  
  let userRole = ''
  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser)
      userRole = parsed?.role || ''
    } catch (e) {}
  }

  if (!isAuthenticated && !isPublic) {
    // Not logged in → force to login
    return next('/signin')
  }

  if (isAuthenticated && to.path === '/signin') {
    // Already logged in → skip login page
    return next('/ventas')
  }

  if (isAuthenticated && to.path.startsWith('/compras') && userRole !== 'Sistemas') {
    // Protect compras section
    return next('/ventas')
  }

  next()
})

