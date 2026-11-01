/**
 * Superstore Analytics Dashboard - Complete Frontend Application Logic
 * Pure Vanilla JavaScript (ES6+) with Chart.js Integration, Multi-tab Views,
 * Animated KPI Counters, Filter Presets, Toast Notifications & Modal Dialogs.
 */

(function () {
  'use strict';

  // Application Global State
  const state = {
    user: null,
    theme: 'light',
    activeTab: 'view-overview',
    filters: {
      startDate: '2015-01-03',
      endDate: '2018-12-30',
      region: 'All',
      category: 'All',
      segment: 'All',
      shipMode: 'All'
    },
    table: {
      page: 1,
      limit: 15,
      search: '',
      sortBy: 'orderDate',
      sortOrder: 'desc',
      totalPages: 1,
      totalRecords: 0
    },
    charts: {
      monthlySales: null,
      categorySales: null,
      subcategorySales: null,
      regionSales: null,
      segmentSales: null,
      topProducts: null,
      topStates: null,
      shippingModes: null
    },
    kpiValues: {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      averageOrderValue: 0
    },
    defaultBounds: {
      minDate: '2015-01-03',
      maxDate: '2018-12-30'
    }
  };

  // Formatters
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const numberFormatter = new Intl.NumberFormat('en-US');

  // DOM Elements Cache
  const DOM = {
    loader: document.getElementById('dashboard-loader'),
    backendStatus: document.getElementById('backend-status-text'),
    btnRefresh: document.getElementById('btn-refresh'),
    btnLogout: document.getElementById('btn-logout'),
    sidebarLogoutLink: document.getElementById('sidebar-logout-link'),
    userDisplayName: document.getElementById('user-display-name'),
    userAvatar: document.getElementById('user-avatar'),
    themeToggleBtn: document.getElementById('theme-toggle'),
    headerGlobalSearch: document.getElementById('header-global-search'),
    pageTitle: document.getElementById('page-title'),
    breadcrumbCurrent: document.getElementById('breadcrumb-current'),
    
    // Sidebar & Drawer Controls
    dashboardSidebar: document.getElementById('dashboard-sidebar'),
    btnCollapseSidebar: document.getElementById('btn-collapse-sidebar'),
    btnMobileSidebarToggle: document.getElementById('btn-mobile-sidebar-toggle'),
    btnCloseMobileSidebar: document.getElementById('btn-close-mobile-sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    sidebarLinks: document.querySelectorAll('.sidebar-link[data-tab]'),
    
    // Quick Presets
    presetPills: document.querySelectorAll('.preset-pill'),
    
    // Header Actions
    btnHeaderExportCsv: document.getElementById('btn-header-export-csv'),
    btnHeaderPrint: document.getElementById('btn-header-print'),
    btnOrdersExportCsv: document.getElementById('btn-orders-export-csv'),
    btnReportExportCsv: document.getElementById('btn-report-export-csv'),
    btnPrintExecutiveReport: document.getElementById('btn-print-executive-report'),
    btnSidebarExport: document.getElementById('btn-sidebar-export'),
    btnSidebarPrint: document.getElementById('btn-sidebar-print'),
    btnSidebarAudit: document.getElementById('btn-sidebar-audit'),
    btnViewAllOrders: document.getElementById('btn-view-all-orders'),

    // Filter controls
    btnApplyFilters: document.getElementById('btn-apply-filters'),
    btnResetFilters: document.getElementById('btn-reset-filters'),
    filterStartDate: document.getElementById('filter-start-date'),
    filterEndDate: document.getElementById('filter-end-date'),
    filterRegion: document.getElementById('filter-region'),
    filterCategory: document.getElementById('filter-category'),
    filterSegment: document.getElementById('filter-segment'),
    filterShipMode: document.getElementById('filter-ship-mode'),
    filterCountBadge: document.getElementById('filter-count-badge'),
    activeFilterSummary: document.getElementById('active-filter-summary'),
    matchingRecordsText: document.getElementById('matching-records-text'),

    // KPI elements
    kpiTotalSales: document.getElementById('kpi-total-sales'),
    kpiTotalOrders: document.getElementById('kpi-total-orders'),
    kpiTotalCustomers: document.getElementById('kpi-total-customers'),
    kpiTotalProducts: document.getElementById('kpi-total-products'),
    kpiAov: document.getElementById('kpi-aov'),

    // Recent orders
    recentOrdersBody: document.getElementById('recent-orders-body'),

    // Table elements
    tableSearchInput: document.getElementById('table-search-input'),
    tablePageSize: document.getElementById('table-page-size'),
    tableBody: document.getElementById('table-body'),
    tableTotalCount: document.getElementById('table-total-count'),
    paginationInfo: document.getElementById('pagination-info'),
    paginationControls: document.getElementById('pagination-controls'),
    tableHeaders: document.querySelectorAll('#sales-data-table th[data-sort]'),

    // Reports elements
    reportSalesVal: document.getElementById('report-sales-val'),
    reportOrdersVal: document.getElementById('report-orders-val'),
    reportCustomersVal: document.getElementById('report-customers-val'),
    reportProductsVal: document.getElementById('report-products-val'),
    reportAovVal: document.getElementById('report-aov-val'),
    reportDateStr: document.getElementById('report-date-str'),
    reportUserName: document.getElementById('report-user-name'),

    // Profile elements
    profileLargeAvatar: document.getElementById('profile-large-avatar'),
    profileCardName: document.getElementById('profile-card-name'),
    profileMetaUsername: document.getElementById('profile-meta-username'),
    profileEditForm: document.getElementById('profile-edit-form'),
    profileInputFullName: document.getElementById('profile-input-fullname'),

    // Settings elements
    passwordChangeForm: document.getElementById('password-change-form'),
    inputCurrentPassword: document.getElementById('input-current-password'),
    inputNewPassword: document.getElementById('input-new-password'),
    inputConfirmNewPassword: document.getElementById('input-confirm-new-password'),
    themeRadioLight: document.getElementById('theme-radio-light'),
    themeRadioDark: document.getElementById('theme-radio-dark'),

    // Modals & Toasts
    auditModal: document.getElementById('audit-modal'),
    btnCloseAuditModal: document.getElementById('btn-close-audit-modal'),
    btnModalCloseAudit: document.getElementById('btn-modal-close-audit'),
    auditMissingRows: document.getElementById('audit-missing-rows'),

    confirmModal: document.getElementById('confirm-modal'),
    confirmModalTitle: document.getElementById('confirm-modal-title'),
    confirmModalMessage: document.getElementById('confirm-modal-message'),
    btnConfirmCancel: document.getElementById('btn-confirm-cancel'),
    btnConfirmProceed: document.getElementById('btn-confirm-proceed'),
    btnCloseConfirmModal: document.getElementById('btn-close-confirm-modal'),
    toastContainer: document.getElementById('toast-container')
  };

  /**
   * Helper: Get current theme colors for Chart.js
   */
  function getChartThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      textColor: isDark ? '#94a3b8' : '#64748b',
      gridColor: isDark ? '#243049' : '#f1f5f9',
      doughnutBorder: isDark ? '#151c2c' : '#ffffff'
    };
  }

  /**
   * Helper: Build query string for analytics APIs
   */
  function buildQueryString(extraParams = {}) {
    const params = new URLSearchParams();

    if (state.filters.startDate) params.set('startDate', state.filters.startDate);
    if (state.filters.endDate) params.set('endDate', state.filters.endDate);
    if (state.filters.region && state.filters.region !== 'All') params.set('region', state.filters.region);
    if (state.filters.category && state.filters.category !== 'All') params.set('category', state.filters.category);
    if (state.filters.segment && state.filters.segment !== 'All') params.set('segment', state.filters.segment);
    if (state.filters.shipMode && state.filters.shipMode !== 'All') params.set('shipMode', state.filters.shipMode);

    for (const [k, v] of Object.entries(extraParams)) {
      if (v !== undefined && v !== null && v !== '') {
        params.set(k, v);
      }
    }

    return params.toString() ? `?${params.toString()}` : '';
  }

  /**
   * UI: Toggle Loading Overlay
   */
  function setLoading(isLoading) {
    if (DOM.loader) {
      DOM.loader.style.display = isLoading ? 'flex' : 'none';
    }
  }

  /**
   * Toast Notification Manager
   */
  function showToast(message, type = 'info', duration = 3500) {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else {
      iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `
      ${iconSvg}
      <div style="flex: 1; font-weight: 500;">${escapeHtml(message)}</div>
      <button style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.2rem;" aria-label="Close notification">✕</button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  }

  /**
   * Confirmation Dialog Modal
   */
  let pendingConfirmAction = null;

  function showConfirm(title, message, confirmBtnText = 'Confirm', onConfirm) {
    if (!DOM.confirmModal) {
      if (window.confirm(message)) onConfirm();
      return;
    }
    DOM.confirmModalTitle.textContent = title;
    DOM.confirmModalMessage.textContent = message;
    DOM.btnConfirmProceed.textContent = confirmBtnText;
    pendingConfirmAction = onConfirm;
    DOM.confirmModal.style.display = 'flex';
  }

  function closeConfirmModal() {
    if (DOM.confirmModal) {
      DOM.confirmModal.style.display = 'none';
    }
    pendingConfirmAction = null;
  }

  /**
   * Animated KPI Number Counter
   */
  function animateValue(element, start, end, duration = 650, isCurrency = false) {
    if (!element) return;
    if (isNaN(end)) {
      element.textContent = isCurrency ? '$0.00' : '0';
      return;
    }

    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;

      if (isCurrency) {
        element.textContent = currencyFormatter.format(current);
      } else {
        element.textContent = numberFormatter.format(Math.round(current));
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        if (isCurrency) {
          element.textContent = currencyFormatter.format(end);
        } else {
          element.textContent = numberFormatter.format(Math.round(end));
        }
      }
    }

    requestAnimationFrame(updateCounter);
  }

  /**
   * Initialize Dashboard
   */
  async function initDashboard() {
    // 1. Verify User Authentication Session
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) return;

    // 2. Setup theme system & preference listeners
    initTheme();

    // 3. Setup tabs & routing
    initTabRouting();

    // 4. Setup sidebar collapse & mobile drawer
    initSidebarControls();

    // 5. Setup event listeners
    setupEventListeners();

    // 6. Verify Backend & Dataset Health
    await checkHealth();

    // 7. Load filter bounds and data
    await loadFilterBounds();
    await loadAllData();
  }

  /**
   * Verify Authentication
   */
  async function checkAuthentication() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (!res.ok || !data.authenticated || !data.user) {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
        return false;
      }

      state.user = data.user;

      // Populate user info across UI
      updateUserDisplay(data.user);

      return true;
    } catch (err) {
      console.error('Failed to verify session:', err);
      window.location.href = '/login.html';
      return false;
    }
  }

  function updateUserDisplay(user) {
    const displayName = user.fullName || user.username;
    const initials = user.fullName
      ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : user.username.slice(0, 2).toUpperCase();

    if (DOM.userDisplayName) DOM.userDisplayName.textContent = displayName;
    if (DOM.userAvatar) DOM.userAvatar.textContent = initials;
    if (DOM.profileLargeAvatar) DOM.profileLargeAvatar.textContent = initials;
    if (DOM.profileCardName) DOM.profileCardName.textContent = displayName;
    if (DOM.profileMetaUsername) DOM.profileMetaUsername.textContent = user.username;
    if (DOM.profileInputFullName) DOM.profileInputFullName.value = user.fullName || '';
    if (DOM.reportUserName) DOM.reportUserName.textContent = displayName;
  }

  /**
   * Tab Navigation & Routing
   */
  function initTabRouting() {
    function switchTab(targetId) {
      const panes = document.querySelectorAll('.tab-pane');
      panes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === targetId) {
          pane.classList.add('active');
        }
      });

      // Update sidebar links
      DOM.sidebarLinks.forEach(link => {
        const tab = link.getAttribute('data-tab');
        if (tab === targetId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      state.activeTab = targetId;

      // Update breadcrumbs and titles
      const tabTitleMap = {
        'view-overview': 'Overview',
        'view-sales-analysis': 'Sales Analysis',
        'view-orders': 'Orders Workbench',
        'view-products': 'Products & States',
        'view-reports': 'Reports Center',
        'view-profile': 'User Profile',
        'view-settings': 'System Settings'
      };

      if (DOM.breadcrumbCurrent) {
        DOM.breadcrumbCurrent.textContent = tabTitleMap[targetId] || 'Analytics';
      }

      // Close mobile drawer if open
      closeMobileDrawer();
    }

    // Handle hash on load
    const hash = window.location.hash.replace('#', '');
    const hashMap = {
      'overview': 'view-overview',
      'sales-analysis': 'view-sales-analysis',
      'orders': 'view-orders',
      'products': 'view-products',
      'reports': 'view-reports',
      'profile': 'view-profile',
      'settings': 'view-settings'
    };

    if (hash && hashMap[hash]) {
      switchTab(hashMap[hash]);
    }

    // Listen to hash changes
    window.addEventListener('hashchange', () => {
      const currentHash = window.location.hash.replace('#', '');
      if (hashMap[currentHash]) {
        switchTab(hashMap[currentHash]);
      }
    });

    // Sidebar link clicks
    DOM.sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('data-tab');
        if (targetId) {
          switchTab(targetId);
        }
      });
    });

    if (DOM.btnViewAllOrders) {
      DOM.btnViewAllOrders.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#orders';
        switchTab('view-orders');
      });
    }
  }

  /**
   * Sidebar Collapse & Mobile Drawer
   */
  function initSidebarControls() {
    // Desktop collapse
    const isCollapsed = localStorage.getItem('superstore_sidebar_collapsed') === 'true';
    if (isCollapsed && DOM.dashboardSidebar) {
      DOM.dashboardSidebar.classList.add('collapsed');
    }

    if (DOM.btnCollapseSidebar) {
      DOM.btnCollapseSidebar.addEventListener('click', () => {
        if (!DOM.dashboardSidebar) return;
        DOM.dashboardSidebar.classList.toggle('collapsed');
        const nowCollapsed = DOM.dashboardSidebar.classList.contains('collapsed');
        localStorage.setItem('superstore_sidebar_collapsed', nowCollapsed ? 'true' : 'false');
      });
    }

    // Mobile drawer toggle
    if (DOM.btnMobileSidebarToggle) {
      DOM.btnMobileSidebarToggle.addEventListener('click', openMobileDrawer);
    }
    if (DOM.btnCloseMobileSidebar) {
      DOM.btnCloseMobileSidebar.addEventListener('click', closeMobileDrawer);
    }
    if (DOM.sidebarBackdrop) {
      DOM.sidebarBackdrop.addEventListener('click', closeMobileDrawer);
    }
  }

  function openMobileDrawer() {
    if (DOM.dashboardSidebar) DOM.dashboardSidebar.classList.add('mobile-open');
    if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.add('active');
  }

  function closeMobileDrawer() {
    if (DOM.dashboardSidebar) DOM.dashboardSidebar.classList.remove('mobile-open');
    if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.remove('active');
  }

  /**
   * Theme Management (Light & Dark Mode)
   */
  function initTheme() {
    const saved = localStorage.getItem('superstore_theme');
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const activeTheme = isDark ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', activeTheme);
    state.theme = activeTheme;
    updateThemeUI(activeTheme);

    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') === 'dark';
        const next = current ? 'light' : 'dark';
        applyTheme(next);
      });
    }

    if (DOM.themeRadioLight) {
      DOM.themeRadioLight.addEventListener('change', () => applyTheme('light'));
    }
    if (DOM.themeRadioDark) {
      DOM.themeRadioDark.addEventListener('change', () => applyTheme('dark'));
    }
  }

  function applyTheme(newTheme) {
    document.documentElement.setAttribute('data-theme', newTheme);
    state.theme = newTheme;
    localStorage.setItem('superstore_theme', newTheme);
    updateThemeUI(newTheme);

    // Re-render charts with new theme colors
    loadCharts();
    showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info', 2000);
  }

  function updateThemeUI(theme) {
    const isDark = theme === 'dark';
    const moon = document.querySelector('.icon-moon');
    const sun = document.querySelector('.icon-sun');
    if (moon && sun) {
      moon.style.display = isDark ? 'none' : 'block';
      sun.style.display = isDark ? 'block' : 'none';
    }
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
    if (DOM.themeRadioLight) DOM.themeRadioLight.checked = !isDark;
    if (DOM.themeRadioDark) DOM.themeRadioDark.checked = isDark;
  }

  /**
   * Check Server and Dataset Health
   */
  async function checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const json = await res.json();
        if (DOM.backendStatus) {
          DOM.backendStatus.textContent = `Backend Connected (${numberFormatter.format(json.dataset.totalRecords)} records)`;
        }
      }
    } catch (err) {
      console.warn('Backend health check warning:', err);
      if (DOM.backendStatus) {
        DOM.backendStatus.textContent = 'Backend Offline';
      }
    }
  }

  /**
   * Load Date Bounds and Populate Defaults
   */
  async function loadFilterBounds() {
    try {
      const res = await fetch('/api/analytics/filters');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const { dateRange } = json.data;
          if (dateRange && dateRange.minDate && dateRange.maxDate) {
            state.defaultBounds = dateRange;
            if (DOM.filterStartDate) {
              DOM.filterStartDate.min = dateRange.minDate;
              DOM.filterStartDate.max = dateRange.maxDate;
              DOM.filterStartDate.value = dateRange.minDate;
              state.filters.startDate = dateRange.minDate;
            }
            if (DOM.filterEndDate) {
              DOM.filterEndDate.min = dateRange.minDate;
              DOM.filterEndDate.max = dateRange.maxDate;
              DOM.filterEndDate.value = dateRange.maxDate;
              state.filters.endDate = dateRange.maxDate;
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  }

  /**
   * Load All Dashboard Sections
   */
  async function loadAllData() {
    setLoading(true);
    try {
      await Promise.all([
        loadKPIs(),
        loadCharts(),
        loadTable(),
        loadRecentOrders()
      ]);
      updateFilterSummaryUI();
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      showToast('Error refreshing analytics data.', 'error');
    } finally {
      setLoading(false);
    }
  }

  /**
   * 1. Load KPI Summary Cards with Animation
   */
  async function loadKPIs() {
    try {
      const qs = buildQueryString();
      const res = await fetch(`/api/analytics/summary${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;

        // Animate KPI numbers
        animateValue(DOM.kpiTotalSales, state.kpiValues.totalSales, d.totalSales, 650, true);
        animateValue(DOM.kpiTotalOrders, state.kpiValues.totalOrders, d.totalOrders, 650, false);
        animateValue(DOM.kpiTotalCustomers, state.kpiValues.totalCustomers, d.totalCustomers, 650, false);
        animateValue(DOM.kpiTotalProducts, state.kpiValues.totalProducts, d.totalProducts, 650, false);
        animateValue(DOM.kpiAov, state.kpiValues.averageOrderValue, d.averageOrderValue, 650, true);

        // Update Reports View KPIs as well
        if (DOM.reportSalesVal) DOM.reportSalesVal.textContent = currencyFormatter.format(d.totalSales);
        if (DOM.reportOrdersVal) DOM.reportOrdersVal.textContent = numberFormatter.format(d.totalOrders);
        if (DOM.reportCustomersVal) DOM.reportCustomersVal.textContent = numberFormatter.format(d.totalCustomers);
        if (DOM.reportProductsVal) DOM.reportProductsVal.textContent = numberFormatter.format(d.totalProducts);
        if (DOM.reportAovVal) DOM.reportAovVal.textContent = currencyFormatter.format(d.averageOrderValue);

        // Store current values for smooth animation delta next time
        state.kpiValues = {
          totalSales: d.totalSales,
          totalOrders: d.totalOrders,
          totalCustomers: d.totalCustomers,
          totalProducts: d.totalProducts,
          averageOrderValue: d.averageOrderValue
        };

        if (DOM.filterCountBadge) {
          DOM.filterCountBadge.textContent = `Analyzing ${numberFormatter.format(d.recordCount)} records`;
        }
        if (DOM.matchingRecordsText) {
          DOM.matchingRecordsText.textContent = `${numberFormatter.format(d.recordCount)} transactions matched`;
        }
      }
    } catch (err) {
      console.error('Failed to fetch KPI summary:', err);
    }
  }

  /**
   * 2. Load and Render All 8 Charts
   */
  async function loadCharts() {
    const qs = buildQueryString();
    await Promise.all([
      fetchChartMonthlySales(qs),
      fetchChartCategorySales(qs),
      fetchChartSubcategorySales(qs),
      fetchChartRegionSales(qs),
      fetchChartSegmentSales(qs),
      fetchChartTopProducts(qs),
      fetchChartTopStates(qs),
      fetchChartShippingModes(qs)
    ]);
  }

  /* --- Chart 1: Monthly Sales Trend (Line) --- */
  async function fetchChartMonthlySales(qs) {
    try {
      const themeColors = getChartThemeColors();
      const res = await fetch(`/api/analytics/monthly-sales${qs}`);
      const json = await res.json();
      if (!json.success || !json.data) return;

      const labels = json.data.map(d => d.label);
      const sales = json.data.map(d => d.sales);
      const orders = json.data.map(d => d.orderCount);

      const ctx = document.getElementById('chart-monthly-sales');
      if (!ctx) return;

      if (state.charts.monthlySales) state.charts.monthlySales.destroy();

      state.charts.monthlySales = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Monthly Sales ($)',
            data: sales,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            pointHoverRadius: 6,
            pointBackgroundColor: '#2563eb'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `Sales: ${currencyFormatter.format(context.parsed.y)}`,
                afterLabel: (context) => `Orders: ${numberFormatter.format(orders[context.dataIndex])}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { maxTicksLimit: 12, color: themeColors.textColor, font: { size: 11 } }
            },
            y: {
              beginAtZero: true,
              grid: { color: themeColors.gridColor },
              ticks: {
                callback: (value) => `$${numberFormatter.format(value)}`,
                color: themeColors.textColor,
                font: { size: 11 }
              }
            }
          }
        }
      });
    } catch (err) {
      console.error('Error in monthly sales chart:', err);
    }
  }

  /* --- Chart 2: Category-wise Sales (Doughnut) --- */
  async function fetchChartCategorySales(qs) {
    try {
      const themeColors = getChartThemeColors();
      const res = await fetch(`/api/analytics/category-sales${qs}`);
      const json = await res.json();
      if (!json.success || !json.data) return;

      const labels = json.data.map(d => d.category);
      const sales = json.data.map(d => d.sales);
      const percentages = json.data.map(d => d.percentage);

      const ctx = document.getElementById('chart-category-sales');
      if (!ctx) return;

      if (state.charts.categorySales) state.charts.categorySales.destroy();

      state.charts.categorySales = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: sales,
            backgroundColor: ['#2563eb', '#f59e0b', '#10b981'],
            borderWidth: 2,
            borderColor: themeColors.doughnutBorder
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: themeColors.textColor, boxWidth: 14, font: { size: 12 } }
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${labels[context.dataIndex]}: ${currencyFormatter.format(sales[context.dataIndex])} (${percentages[context.dataIndex]}%)`
              }
            }
          },
          cutout: '62%'
        }
      });
    } catch (err) {
      console.error('Error in category sales chart:', err);
    }
  }

  /* --- Chart 3: Sub-Category Sales (Vertical Bar) --- */
  async function fetchChartSubcategorySales(qs) {
    try {
      const themeColors = getChartThemeColors();
      const res = await fetch(`/api/analytics/subcategory-sales${qs}`);
      const json = await res.json();
      if (!json.success || !json.data) return;

      const labels = json.data.map(d => d.subCategory);
      const sales = json.data.map(d => d.sales);

      const ctx = document.getElementById('chart-subcategory-sales');
      if (!ctx) return;

      if (state.charts.subcategorySales) state.charts.subcategorySales.destroy();

      state.charts.subcategorySales = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: sales,
            backgroundColor: '#2563eb',
            hoverBackgroundColor: '#1d4ed8',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `Sales: ${currencyFormatter.format(context.parsed.y)}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: themeColors.textColor, font: { size: 10 }, maxRotation: 45, minRotation: 45 }
            },
            y: {
              beginAtZero: true,
              grid: { color: themeColors.gridColor },
              ticks: {
                callback: (v) => `$${numberFormatter.format(v)}`,
                color: themeColors.textColor,
                font: { size: 11 }
              }
            }
          }
        }
      });
    } catch (err) {
      console.error('Error in subcategory sales chart:', err);
    }
  }

  /* --- Chart 4: Region-wise Sales (Bar) --- */
  async function fetchChartRegionSales(qs) {
    try {
      const themeColors = getChartThemeColors();
      const res = await fetch(`/api/analytics/region-sales${qs}`);
      const json = await res.json();
      if (!json.success || !json.data) return;

      const labels = json.data.map(d => d.region);
      const sales = json.data.map(d => d.sales);

      const ctx = document.getElementById('chart-region-sales');
      if (!ctx) return;

      if (state.charts.regionSales) state.charts.regionSales.destroy();

      state.charts.regionSales = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: sales,
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `Sales: ${currencyFormatter.format(context.parsed.y)}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: themeColors.textColor, font: { size: 11 } } },
            y: {
              beginAtZero: true,
              grid: { color: themeColors.gridColor },
              ticks: {
                callback: (v) => `$${numberFormatter.format(v)}`,
                color: themeColors.textColor
              }
            }
          }
        }
      });
    } catch (err) {
      console.error('Error in region sales chart:', err);
    }
  }

  /* --- Chart 5: Customer Segment Analysis (Doughnut) --- */
  async function fetchChartSegmentSales(qs) {
    try {
      const themeColors = getChartThemeColors();
      const res = await fetch(`/api/analytics/segment-sales${qs}`);
      const json = await res.json();
      if (!json.success || !json.data) return;

      const labels = json.data.map(d => d.segment);
      const sales = json.data.map(d => d.sales);
      const percentages = json.data.map(d => d.percentage);

      const ctx = document.getElementById('chart-segment-sales');
      if (!ctx) return;

      if (state.charts.segmentSales) state.charts.segmentSales.destroy();

      state.charts.segmentSales = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: sales,
            backgroundColor: ['#06b6d4', '#ec4899', '#f97316'],
            borderWidth: 2,
            borderColor: themeColors.doughnutBorder
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: themeColors.textColor, boxWidth: 14, font: { size: 12 } }
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${labels[context.dataIndex]}: ${currencyFormatter.format(sales[context.dataIndex])} (${percentages[context.dataIndex]}%)`
              }
            }
          },
          cutout: '62%'
        }
      });
    } catch (err) {
      console.error('Error in segment sales chart:', err);
    }
  }

  /* --- Chart 6: Shipping Mode Analysis (Doughnut) --- */
  async function fetchChartShippingModes(qs) {
    try {
      const themeColors = getChartThemeColors();
      const res = await fetch(`/api/analytics/shipping-modes${qs}`);
      const json = await res.json();
      if (!json.success || !json.data) return;

      const labels = json.data.map(d => d.shipMode);
      const sales = json.data.map(d => d.sales);
      const percentages = json.data.map(d => d.percentage);

      const ctx = document.getElementById('chart-shipping-modes');
      if (!ctx) return;

      if (state.charts.shippingModes) state.charts.shippingModes.destroy();

      state.charts.shippingModes = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: sales,
            backgroundColor: ['#6366f1', '#14b8a6', '#f43f5e', '#eab308'],
            borderWidth: 2,
            borderColor: themeColors.doughnutBorder
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: themeColors.textColor, boxWidth: 14, font: { size: 12 } }
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${labels[context.dataIndex]}: ${currencyFormatter.format(sales[context.dataIndex])} (${percentages[context.dataIndex]}%)`
              }
            }
          },
          cutout: '62%'
        }
      });
    } catch (err) {
      console.error('Error in shipping modes chart:', err);
    }
  }

  /* --- Chart 7: Top 10 Products by Sales (Horizontal Bar) --- */
  async function fetchChartTopProducts(qs) {
    try {
      const themeColors = getChartThemeColors();
      const res = await fetch(`/api/analytics/top-products${qs}&limit=10`);
      const json = await res.json();
      if (!json.success || !json.data) return;

      const labels = json.data.map(d => d.productName.length > 25 ? d.productName.slice(0, 25) + '...' : d.productName);
      const sales = json.data.map(d => d.sales);

      const ctx = document.getElementById('chart-top-products');
      if (!ctx) return;

      if (state.charts.topProducts) state.charts.topProducts.destroy();

      state.charts.topProducts = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: sales,
            backgroundColor: '#10b981',
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => json.data[items[0].dataIndex].productName,
                label: (context) => `Total Sales: ${currencyFormatter.format(context.parsed.x)}`
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: themeColors.gridColor },
              ticks: {
                callback: (v) => `$${numberFormatter.format(v)}`,
                color: themeColors.textColor
              }
            },
            y: {
              grid: { display: false },
              ticks: { color: themeColors.textColor, font: { size: 10 } }
            }
          }
        }
      });
    } catch (err) {
      console.error('Error in top products chart:', err);
    }
  }

  /* --- Chart 8: Top 10 States by Sales (Bar) --- */
  async function fetchChartTopStates(qs) {
    try {
      const themeColors = getChartThemeColors();
      const res = await fetch(`/api/analytics/top-states${qs}&limit=10`);
      const json = await res.json();
      if (!json.success || !json.data) return;

      const labels = json.data.map(d => d.state);
      const sales = json.data.map(d => d.sales);

      const ctx = document.getElementById('chart-top-states');
      if (!ctx) return;

      if (state.charts.topStates) state.charts.topStates.destroy();

      state.charts.topStates = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: sales,
            backgroundColor: '#8b5cf6',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `Total Sales: ${currencyFormatter.format(context.parsed.y)}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: themeColors.textColor, font: { size: 11 } } },
            y: {
              beginAtZero: true,
              grid: { color: themeColors.gridColor },
              ticks: {
                callback: (v) => `$${numberFormatter.format(v)}`,
                color: themeColors.textColor
              }
            }
          }
        }
      });
    } catch (err) {
      console.error('Error in top states chart:', err);
    }
  }

  /**
   * 3. Load Recent Orders (5 records) for Overview Tab
   */
  async function loadRecentOrders() {
    try {
      const qs = buildQueryString({ limit: 5 });
      const res = await fetch(`/api/analytics/recent-orders${qs}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data && DOM.recentOrdersBody) {
        if (json.data.length === 0) {
          DOM.recentOrdersBody.innerHTML = `
            <tr>
              <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                No recent transactions found.
              </td>
            </tr>
          `;
          return;
        }

        DOM.recentOrdersBody.innerHTML = json.data.map(r => `
          <tr>
            <td><strong>${escapeHtml(r.orderId)}</strong></td>
            <td>${escapeHtml(r.orderDate)}</td>
            <td>${escapeHtml(r.customerName)}</td>
            <td><span class="badge badge-primary">${escapeHtml(r.segment)}</span></td>
            <td>${escapeHtml(r.category)}</td>
            <td class="sales-cell">${currencyFormatter.format(r.sales)}</td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.warn('Failed to load recent orders:', err);
    }
  }

  /**
   * 4. Load Sales Records Table
   */
  async function loadTable() {
    try {
      const extraParams = {
        page: state.table.page,
        limit: state.table.limit,
        search: state.table.search,
        sortBy: state.table.sortBy,
        sortOrder: state.table.sortOrder
      };

      const qs = buildQueryString(extraParams);
      const res = await fetch(`/api/analytics/orders${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.success && json.data) {
        renderTableRows(json.data);
        renderPagination(json.pagination);
      }
    } catch (err) {
      console.error('Error loading table records:', err);
      if (DOM.tableBody) {
        DOM.tableBody.innerHTML = `
          <tr>
            <td colspan="9" class="empty-state">
              <div style="color: var(--danger); font-weight: 600;">Failed to load order records.</div>
              <div style="font-size: 0.8rem; margin-top: 0.25rem;">${err.message}</div>
            </td>
          </tr>
        `;
      }
    }
  }

  function renderTableRows(records) {
    if (!DOM.tableBody) return;

    if (!records || records.length === 0) {
      DOM.tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <div style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">No sales records found</div>
            <div style="font-size: 0.825rem; margin-top: 0.25rem;">Try adjusting your search terms or active filters</div>
          </td>
        </tr>
      `;
      return;
    }

    const rowsHtml = records.map((r) => `
      <tr>
        <td><strong>${escapeHtml(r.orderId)}</strong></td>
        <td>${escapeHtml(r.orderDate)}</td>
        <td>${escapeHtml(r.customerName)}</td>
        <td><span class="badge badge-primary">${escapeHtml(r.segment)}</span></td>
        <td>${escapeHtml(r.region)}</td>
        <td>${escapeHtml(r.category)}</td>
        <td>${escapeHtml(r.subCategory)}</td>
        <td title="${escapeHtml(r.productName)}" style="max-width: 280px; overflow: hidden; text-overflow: ellipsis;">
          ${escapeHtml(r.productName)}
        </td>
        <td class="sales-cell">${currencyFormatter.format(r.sales)}</td>
      </tr>
    `).join('');

    DOM.tableBody.innerHTML = rowsHtml;
  }

  function renderPagination(pagination) {
    state.table.totalPages = pagination.totalPages;
    state.table.totalRecords = pagination.totalRecords;

    if (DOM.tableTotalCount) {
      DOM.tableTotalCount.textContent = `${numberFormatter.format(pagination.totalRecords)} Records`;
    }

    if (DOM.paginationInfo) {
      const start = pagination.totalRecords === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
      const end = Math.min(pagination.page * pagination.limit, pagination.totalRecords);
      DOM.paginationInfo.textContent = `Showing ${numberFormatter.format(start)} to ${numberFormatter.format(end)} of ${numberFormatter.format(pagination.totalRecords)} records`;
    }

    if (!DOM.paginationControls) return;

    const { page, totalPages } = pagination;
    const buttons = [];

    // First button
    buttons.push(`
      <button class="pagination-btn" data-page="1" ${page === 1 ? 'disabled' : ''} title="First Page">
        «
      </button>
    `);

    // Prev button
    buttons.push(`
      <button class="pagination-btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} title="Previous Page">
        ‹
      </button>
    `);

    // Dynamic numeric pages
    const rangeStart = Math.max(1, page - 2);
    const rangeEnd = Math.min(totalPages, page + 2);

    for (let p = rangeStart; p <= rangeEnd; p++) {
      buttons.push(`
        <button class="pagination-btn ${p === page ? 'active' : ''}" data-page="${p}">
          ${p}
        </button>
      `);
    }

    // Next button
    buttons.push(`
      <button class="pagination-btn" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''} title="Next Page">
        ›
      </button>
    `);

    // Last button
    buttons.push(`
      <button class="pagination-btn" data-page="${totalPages}" ${page >= totalPages ? 'disabled' : ''} title="Last Page">
        »
      </button>
    `);

    DOM.paginationControls.innerHTML = buttons.join('');

    // Attach click handlers
    DOM.paginationControls.querySelectorAll('.pagination-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetPage = parseInt(btn.getAttribute('data-page'), 10);
        if (targetPage && targetPage !== state.table.page && targetPage >= 1 && targetPage <= state.table.totalPages) {
          state.table.page = targetPage;
          loadTable();
        }
      });
    });
  }

  /**
   * Update Active Filter Summary Banner
   */
  function updateFilterSummaryUI() {
    if (!DOM.activeFilterSummary) return;

    const parts = [];
    parts.push(`Date: ${state.filters.startDate} to ${state.filters.endDate}`);
    if (state.filters.region !== 'All') parts.push(`Region: ${state.filters.region}`);
    if (state.filters.category !== 'All') parts.push(`Category: ${state.filters.category}`);
    if (state.filters.segment !== 'All') parts.push(`Segment: ${state.filters.segment}`);
    if (state.filters.shipMode !== 'All') parts.push(`Ship Mode: ${state.filters.shipMode}`);

    const label = parts.length === 1 && state.filters.startDate === state.defaultBounds.minDate && state.filters.endDate === state.defaultBounds.maxDate
      ? 'All Records (2015-01-03 to 2018-12-30)'
      : parts.join(' • ');

    const summarySpan = DOM.activeFilterSummary.querySelector('span:first-child');
    if (summarySpan) {
      summarySpan.innerHTML = `Active criteria: <strong>${escapeHtml(label)}</strong>`;
    }
  }

  /**
   * Handle CSV Export
   */
  function handleCsvExport() {
    showToast('Preparing filtered CSV export...', 'info', 2000);
    const qs = buildQueryString();
    window.location.href = `/api/analytics/export-csv${qs}`;
    setTimeout(() => {
      showToast('CSV export started!', 'success', 3000);
    }, 1000);
  }

  /**
   * Handle Print Report
   */
  function handlePrintReport() {
    // Switch to Reports tab
    window.location.hash = '#reports';
    const reportTab = document.getElementById('view-reports');
    if (reportTab) {
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      reportTab.classList.add('active');
    }
    setTimeout(() => {
      window.print();
    }, 300);
  }

  /**
   * Open Data Quality Audit Modal
   */
  async function openDataQualityAuditModal() {
    if (!DOM.auditModal) return;
    DOM.auditModal.style.display = 'flex';

    if (DOM.auditMissingRows) {
      DOM.auditMissingRows.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1rem;">Loading Burlington VT records...</td></tr>`;
      try {
        const res = await fetch('/api/analytics/data-quality');
        const json = await res.json();
        if (json.success && json.data && json.data.missingPostalRecords) {
          DOM.auditMissingRows.innerHTML = json.data.missingPostalRecords.map(r => `
            <tr>
              <td><strong>${escapeHtml(r.rowId)}</strong></td>
              <td>${escapeHtml(r.orderId)}</td>
              <td>${escapeHtml(r.orderDate)}</td>
              <td>${escapeHtml(r.customerName)}</td>
              <td>${escapeHtml(r.city)}, ${escapeHtml(r.state)}</td>
              <td class="sales-cell">${currencyFormatter.format(r.sales)}</td>
            </tr>
          `).join('');
        }
      } catch (err) {
        DOM.auditMissingRows.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); padding: 1rem;">Failed to load audit records.</td></tr>`;
      }
    }
  }

  function closeDataQualityAuditModal() {
    if (DOM.auditModal) {
      DOM.auditModal.style.display = 'none';
    }
  }

  /**
   * Handle User Logout
   */
  function confirmAndLogout() {
    showConfirm(
      'Sign Out of Session',
      'Are you sure you want to log out of your Superstore Analytics session?',
      'Yes, Sign Out',
      async () => {
        try {
          const res = await fetch('/api/auth/logout', { method: 'POST' });
          if (res.ok) {
            window.location.href = '/login.html';
          }
        } catch (err) {
          console.error('Logout failed:', err);
          window.location.href = '/login.html';
        }
      }
    );
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // 1. Refresh button
    if (DOM.btnRefresh) {
      DOM.btnRefresh.addEventListener('click', () => {
        loadAllData();
        showToast('Dashboard data refreshed!', 'success');
      });
    }

    // 2. Logout buttons
    if (DOM.btnLogout) DOM.btnLogout.addEventListener('click', confirmAndLogout);
    if (DOM.sidebarLogoutLink) {
      DOM.sidebarLogoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        confirmAndLogout();
      });
    }

    // 3. Confirmation modal handlers
    if (DOM.btnConfirmProceed) {
      DOM.btnConfirmProceed.addEventListener('click', () => {
        if (typeof pendingConfirmAction === 'function') {
          pendingConfirmAction();
        }
        closeConfirmModal();
      });
    }
    if (DOM.btnConfirmCancel) DOM.btnConfirmCancel.addEventListener('click', closeConfirmModal);
    if (DOM.btnCloseConfirmModal) DOM.btnCloseConfirmModal.addEventListener('click', closeConfirmModal);

    // 4. Header Global Search input
    if (DOM.headerGlobalSearch) {
      DOM.headerGlobalSearch.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        state.table.search = val;
        if (DOM.tableSearchInput) DOM.tableSearchInput.value = val;
        state.table.page = 1;
        loadTable();
      });

      DOM.headerGlobalSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          window.location.hash = '#orders';
        }
      });
    }

    // 5. Quick Date Presets
    if (DOM.presetPills) {
      DOM.presetPills.forEach(pill => {
        pill.addEventListener('click', () => {
          DOM.presetPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');

          const preset = pill.getAttribute('data-preset');
          if (preset === '2018') {
            state.filters.startDate = '2018-01-01';
            state.filters.endDate = '2018-12-30';
          } else if (preset === '2017') {
            state.filters.startDate = '2017-01-01';
            state.filters.endDate = '2017-12-31';
          } else if (preset === '2016') {
            state.filters.startDate = '2016-01-01';
            state.filters.endDate = '2016-12-31';
          } else if (preset === '2015') {
            state.filters.startDate = '2015-01-03';
            state.filters.endDate = '2015-12-31';
          } else {
            // All
            state.filters.startDate = state.defaultBounds.minDate;
            state.filters.endDate = state.defaultBounds.maxDate;
          }

          if (DOM.filterStartDate) DOM.filterStartDate.value = state.filters.startDate;
          if (DOM.filterEndDate) DOM.filterEndDate.value = state.filters.endDate;

          state.table.page = 1;
          loadAllData();
          showToast(`Filtered by ${pill.textContent}`, 'info');
        });
      });
    }

    // 6. Apply Filters button
    if (DOM.btnApplyFilters) {
      DOM.btnApplyFilters.addEventListener('click', () => {
        if (DOM.filterStartDate) state.filters.startDate = DOM.filterStartDate.value;
        if (DOM.filterEndDate) state.filters.endDate = DOM.filterEndDate.value;
        if (DOM.filterRegion) state.filters.region = DOM.filterRegion.value;
        if (DOM.filterCategory) state.filters.category = DOM.filterCategory.value;
        if (DOM.filterSegment) state.filters.segment = DOM.filterSegment.value;
        if (DOM.filterShipMode) state.filters.shipMode = DOM.filterShipMode.value;

        // Reset quick preset active state
        DOM.presetPills.forEach(p => p.classList.remove('active'));

        state.table.page = 1;
        loadAllData();
        showToast('Filters successfully applied!', 'success');
      });
    }

    // 7. Reset Filters button
    if (DOM.btnResetFilters) {
      DOM.btnResetFilters.addEventListener('click', () => {
        state.filters = {
          startDate: state.defaultBounds.minDate,
          endDate: state.defaultBounds.maxDate,
          region: 'All',
          category: 'All',
          segment: 'All',
          shipMode: 'All'
        };

        if (DOM.filterStartDate) DOM.filterStartDate.value = state.defaultBounds.minDate;
        if (DOM.filterEndDate) DOM.filterEndDate.value = state.defaultBounds.maxDate;
        if (DOM.filterRegion) DOM.filterRegion.value = 'All';
        if (DOM.filterCategory) DOM.filterCategory.value = 'All';
        if (DOM.filterSegment) DOM.filterSegment.value = 'All';
        if (DOM.filterShipMode) DOM.filterShipMode.value = 'All';

        state.table.page = 1;
        state.table.search = '';
        if (DOM.tableSearchInput) DOM.tableSearchInput.value = '';
        if (DOM.headerGlobalSearch) DOM.headerGlobalSearch.value = '';

        DOM.presetPills.forEach(p => {
          if (p.getAttribute('data-preset') === 'all') p.classList.add('active');
          else p.classList.remove('active');
        });

        loadAllData();
        showToast('Filters reset to default', 'info');
      });
    }

    // 8. Table Search with Debounce
    let searchDebounceTimeout = null;
    if (DOM.tableSearchInput) {
      DOM.tableSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimeout);
        searchDebounceTimeout = setTimeout(() => {
          state.table.search = e.target.value.trim();
          if (DOM.headerGlobalSearch) DOM.headerGlobalSearch.value = state.table.search;
          state.table.page = 1;
          loadTable();
        }, 300);
      });
    }

    // 9. Table Page Size selector
    if (DOM.tablePageSize) {
      DOM.tablePageSize.addEventListener('change', (e) => {
        state.table.limit = parseInt(e.target.value, 10) || 15;
        state.table.page = 1;
        loadTable();
      });
    }

    // 10. Table Header Sorting
    if (DOM.tableHeaders) {
      DOM.tableHeaders.forEach((th) => {
        th.addEventListener('click', () => {
          const sortField = th.getAttribute('data-sort');
          if (state.table.sortBy === sortField) {
            state.table.sortOrder = state.table.sortOrder === 'asc' ? 'desc' : 'asc';
          } else {
            state.table.sortBy = sortField;
            state.table.sortOrder = (sortField === 'sales' || sortField === 'orderDate') ? 'desc' : 'asc';
          }

          DOM.tableHeaders.forEach((h) => {
            const ind = h.querySelector('.sort-indicator');
            if (h === th) {
              ind.textContent = state.table.sortOrder === 'asc' ? '▲' : '▼';
              ind.style.color = 'var(--primary)';
            } else {
              ind.textContent = '↕';
              ind.style.color = 'var(--text-light)';
            }
          });

          state.table.page = 1;
          loadTable();
        });
      });
    }

    // 11. CSV Export Handlers
    [DOM.btnHeaderExportCsv, DOM.btnOrdersExportCsv, DOM.btnReportExportCsv, DOM.btnSidebarExport].forEach(btn => {
      if (btn) btn.addEventListener('click', handleCsvExport);
    });

    // 12. Print Report Handlers
    [DOM.btnHeaderPrint, DOM.btnPrintExecutiveReport, DOM.btnSidebarPrint].forEach(btn => {
      if (btn) btn.addEventListener('click', handlePrintReport);
    });

    // 13. Data Quality Audit Modal Handlers
    if (DOM.btnSidebarAudit) DOM.btnSidebarAudit.addEventListener('click', openDataQualityAuditModal);
    if (DOM.btnCloseAuditModal) DOM.btnCloseAuditModal.addEventListener('click', closeDataQualityAuditModal);
    if (DOM.btnModalCloseAudit) DOM.btnModalCloseAudit.addEventListener('click', closeDataQualityAuditModal);

    // 14. Profile Edit Form
    if (DOM.profileEditForm) {
      DOM.profileEditForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = DOM.profileInputFullName.value.trim();
        if (!fullName) {
          showToast('Full name cannot be empty.', 'error');
          return;
        }

        try {
          const res = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            state.user.fullName = fullName;
            updateUserDisplay(state.user);
            showToast('Profile updated successfully!', 'success');
          } else {
            showToast(data.message || 'Failed to update profile.', 'error');
          }
        } catch (err) {
          showToast('Network error updating profile.', 'error');
        }
      });
    }

    // 15. Password Change Form
    if (DOM.passwordChangeForm) {
      DOM.passwordChangeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = DOM.inputCurrentPassword.value;
        const newPassword = DOM.inputNewPassword.value;
        const confirmNewPassword = DOM.inputConfirmNewPassword.value;

        if (!currentPassword) {
          showToast('Please enter your current password.', 'error');
          return;
        }
        if (!newPassword || newPassword.length < 6) {
          showToast('New password must be at least 6 characters long.', 'error');
          return;
        }
        if (newPassword !== confirmNewPassword) {
          showToast('New passwords do not match.', 'error');
          return;
        }

        try {
          const res = await fetch('/api/auth/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast('Password changed successfully!', 'success');
            DOM.passwordChangeForm.reset();
          } else {
            showToast(data.message || 'Failed to change password.', 'error');
          }
        } catch (err) {
          showToast('Network error updating password.', 'error');
        }
      });
    }
  }

  /**
   * Helper: Escape HTML to prevent injection
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }
})();
