import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import CreateTicketView from '../views/CreateTicketView.vue'
import TicketDetailView from '../views/TicketDetailView.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/tickets/new', name: 'create', component: CreateTicketView },
    { path: '/tickets/:id(\\d+)', name: 'detail', component: TicketDetailView, props: true},
  ],
})
