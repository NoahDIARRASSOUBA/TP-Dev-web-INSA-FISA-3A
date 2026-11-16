<script setup>
import 'bootstrap/dist/css/bootstrap.min.css'
</script>

<template>
  <div class="min-vh-100 bg-light">
    <header class="bg-dark shadow-sm mb-4">
      <nav
        class="container d-flex flex-wrap align-items-center justify-content-between gap-3 py-3"
        aria-label="Navigation principale"
      >
        <RouterLink class="text-white text-decoration-none fs-4 fw-bold" to="/"
          >Mini Bug-Tracker</RouterLink
        >
        <div class="d-flex flex-wrap gap-2">
          <RouterLink class="btn btn-outline-light" to="/">Tableau de bord</RouterLink>
          <RouterLink class="btn btn-primary" to="/tickets/new">Nouveau ticket</RouterLink>
        </div>
      </nav>
    </header>
    <main class="container pb-5">
      <RouterView />
    </main>
  </div>
</template>
