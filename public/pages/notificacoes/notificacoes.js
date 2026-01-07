/**
 * LogVert - Notificações Page JavaScript
 * Handles filtering, marking as read, and other notification interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // --- FILTER FUNCTIONALITY ---
    // =================================================================
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    const notificationCards = document.querySelectorAll('.notification-card');
    const emptyState = document.getElementById('emptyState');
    const notificationsList = document.querySelector('.notifications-list-full');

    /**
     * Filter notifications by type
     */
    const filterNotifications = (filterType) => {
        let visibleCount = 0;

        notificationCards.forEach(card => {
            const cardType = card.getAttribute('data-type');
            
            if (filterType === 'all' || cardType === filterType) {
                card.classList.remove('hidden');
                card.classList.add('fade-in');
                visibleCount++;
            } else {
                card.classList.add('hidden');
                card.classList.remove('fade-in');
            }
        });

        // Show/hide empty state
        if (visibleCount === 0) {
            if (notificationsList) notificationsList.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (notificationsList) notificationsList.style.display = 'flex';
            if (emptyState) emptyState.style.display = 'none';
        }
    };

    // Add click handlers to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter type and apply
            const filterType = button.getAttribute('data-filter');
            filterNotifications(filterType);
        });
    });

    // =================================================================
    // --- MARK AS READ FUNCTIONALITY ---
    // =================================================================

    const markAllReadBtn = document.getElementById('markAllReadBtn');

    /**
     * Mark a single notification as read
     */
    const markAsRead = (card) => {
        card.classList.remove('unread');
        
        // Remove the unread indicator
        const indicator = card.querySelector('.unread-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        // Change the "Mark as read" button to "Delete"
        const markReadBtn = card.querySelector('[data-action="mark-read"]');
        if (markReadBtn) {
            markReadBtn.setAttribute('data-action', 'delete');
            markReadBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Excluir';
        }
        
        updateBadgeCounts();
    };

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = () => {
        const unreadCards = document.querySelectorAll('.notification-card.unread');
        unreadCards.forEach(card => markAsRead(card));
    };

    /**
     * Delete a notification
     */
    const deleteNotification = (card) => {
        card.classList.add('fade-out');
        
        setTimeout(() => {
            card.remove();
            updateBadgeCounts();
            
            // Check if there are any visible notifications left
            const visibleCards = document.querySelectorAll('.notification-card:not(.hidden)');
            if (visibleCards.length === 0) {
                if (notificationsList) notificationsList.style.display = 'none';
                if (emptyState) emptyState.style.display = 'block';
            }
        }, 300);
    };

    /**
     * Update the badge counts in filters
     */
    const updateBadgeCounts = () => {
        // Update total count
        const totalCount = document.querySelectorAll('.notification-card').length;
        const allFilterCount = document.querySelector('[data-filter="all"] .filter-count');
        if (allFilterCount) allFilterCount.textContent = totalCount;

        // Update unread count (for header badge if applicable)
        const unreadCount = document.querySelectorAll('.notification-card.unread').length;
        
        // Update type-specific counts
        const types = ['return', 'stock', 'billing', 'system'];
        types.forEach(type => {
            const count = document.querySelectorAll(`.notification-card[data-type="${type}"]`).length;
            const filterCount = document.querySelector(`[data-filter="${type}"] .filter-count`);
            if (filterCount) filterCount.textContent = count;
        });
    };

    // Add click handler for "Mark all as read" button
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllAsRead);
    }

    // Event delegation for action buttons
    document.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;

        const card = actionBtn.closest('.notification-card');
        if (!card) return;

        const action = actionBtn.getAttribute('data-action');

        if (action === 'mark-read') {
            markAsRead(card);
        } else if (action === 'delete') {
            deleteNotification(card);
        }
    });

    // =================================================================
    // --- INITIAL SETUP ---
    // =================================================================

    // Initialize badge counts on page load
    updateBadgeCounts();

    console.log('LogVert Notifications Page initialized successfully.');
});
