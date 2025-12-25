/**
 * UNIVERSAL TABLE CONFIGURATION SYSTEM
 * 
 * This file defines all standard table configurations to ensure consistency
 * across the entire application. All tables should use these settings.
 * 
 * DO NOT override these settings in individual components unless absolutely necessary.
 */

/**
 * TABLE PAGINATION SETTINGS
 */
export const TABLE_PAGINATION = {
  // Pagination container styling (used in TablePagination and TablePaginationCompact)
  container: {
    padding: 'px-4 py-3',  // Horizontal and vertical padding
    marginTop: 'mt-4',      // Top margin when pagination is inside Card
    border: 'border-t border-gray-200 dark:border-gray-700',  // Top border
    background: 'bg-gray-50/30 dark:bg-gray-800/30',  // Subtle background
  },
  
  // Compact pagination (for split views, inside cards)
  compact: {
    padding: 'px-4 py-2',
    border: 'border-t border-gray-200 dark:border-gray-700',
    background: 'bg-gray-50/50 dark:bg-gray-800/50',
  },
  
  // Default items per page options
  itemsPerPageOptions: [5, 10, 25, 50, 100],
  
  // Default items per page
  defaultItemsPerPage: 25,
} as const;

/**
 * TABLE HEADER SETTINGS
 */
export const TABLE_HEADER = {
  // Header background uses primary color from branding
  background: 'var(--primaryColor)',
  
  // Header text styling
  text: {
    color: 'text-white/90',
    size: 'text-xs',
    transform: 'uppercase',
    tracking: 'tracking-wide',
    weight: 'font-medium',
  },
  
  // Header cell padding
  padding: 'px-4 py-4',
  
  // First column extra left padding
  firstColumnPadding: 'pl-10',
  
  // Sortable header button styling
  sortButton: {
    hover: 'hover:text-white',
    transition: 'transition-colors',
    display: 'flex items-center',
  },
} as const;

/**
 * TABLE BODY SETTINGS
 */
export const TABLE_BODY = {
  // Row background and borders
  background: 'bg-white dark:bg-gray-800',
  divider: 'divide-y divide-gray-100 dark:divide-gray-700',
  
  // Row hover effect
  rowHover: 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
  
  // Row transition
  rowTransition: 'transition-colors',
  
  // Cell padding
  cellPadding: 'px-4 py-4',
  
  // First column cell padding
  firstCellPadding: 'px-6 py-4 pl-10',
  
  // Last column (actions) alignment
  actionsCellPadding: 'px-4 py-4 pr-8',
} as const;

/**
 * TABLE SORT ICON SETTINGS
 */
export const TABLE_SORT_ICONS = {
  // Icon sizes
  size: 'w-3.5 h-3.5',
  
  // Icon spacing from text
  margin: 'ml-1',
  
  // Inactive sort icon color
  inactiveColor: 'text-gray-400',
  
  // Active sort icon uses primary color
  activeColor: 'var(--primaryColor)',
} as const;

/**
 * TABLE ACTION BUTTONS SETTINGS
 */
export const TABLE_ACTION_BUTTONS = {
  // Action button container
  container: {
    display: 'flex justify-end items-center',
    gap: 'gap-1',
    width: 'w-[72px]',
    align: 'ml-auto',
  },
  
  // Individual action button
  button: {
    size: 'h-8 w-8 p-0',
    variant: 'ghost' as const,
  },
} as const;

/**
 * TABLE CARD CONTAINER SETTINGS
 */
export const TABLE_CARD = {
  // Card that wraps tables
  border: 'border-gray-200/60 dark:border-gray-700',
  shadow: 'shadow-sm',
  background: 'bg-white dark:bg-gray-800',
  
  // Rounded corners
  rounded: 'rounded-lg',
  
  // Overflow for table scrolling
  overflow: 'overflow-hidden',
} as const;

/**
 * TABLE TOOLBAR SETTINGS
 */
export const TABLE_TOOLBAR = {
  // Toolbar container
  container: {
    display: 'flex items-center justify-between',
    padding: 'mb-4 pb-4',
    border: 'border-b border-gray-200 dark:border-gray-700',
  },
  
  // Left side (search and filters)
  leftSection: {
    display: 'flex items-center',
    gap: 'gap-4',
    flex: 'flex-1',
  },
  
  // Right side (action buttons)
  rightSection: {
    display: 'flex',
    gap: 'gap-2',
  },
  
  // Search input
  searchInput: {
    width: 'max-w-md',
    iconPosition: 'absolute left-3 top-1/2 transform -translate-y-1/2',
    iconSize: 'w-4 h-4',
    iconColor: 'text-gray-400 dark:text-gray-500',
    padding: 'pl-9',
  },
} as const;

/**
 * FILTER BUTTON GROUP SETTINGS
 */
export const FILTER_BUTTON_GROUP = {
  // Container styling
  container: {
    display: 'flex items-center',
    gap: 'gap-2',
    background: 'bg-gray-100 dark:bg-gray-800',
    rounded: 'rounded-lg',
    padding: 'p-1',
  },
  
  // Individual filter button
  button: {
    padding: 'px-3 py-1.5',
    rounded: 'rounded',
    textSize: 'text-xs',
    transition: 'transition-colors',
    
    // Active state
    active: {
      text: 'text-white',
      shadow: 'shadow-sm',
      // Background uses var(--primaryColor)
    },
    
    // Inactive state
    inactive: {
      text: 'text-gray-600 dark:text-gray-400',
      hover: 'hover:text-gray-900 dark:hover:text-gray-200',
    },
  },
} as const;

/**
 * HELPER FUNCTIONS
 */
export const getTableClasses = () => ({
  // Get full pagination container classes
  paginationContainer: `${TABLE_PAGINATION.container.padding} ${TABLE_PAGINATION.container.marginTop} ${TABLE_PAGINATION.container.border} ${TABLE_PAGINATION.container.background}`,
  
  // Get full pagination compact classes
  paginationCompactContainer: `${TABLE_PAGINATION.compact.padding} ${TABLE_PAGINATION.compact.border} ${TABLE_PAGINATION.compact.background}`,
  
  // Get header th classes
  headerCell: `${TABLE_HEADER.padding} ${TABLE_HEADER.text.color} ${TABLE_HEADER.text.size} ${TABLE_HEADER.text.transform} ${TABLE_HEADER.text.tracking}`,
  
  // Get header first column classes
  headerFirstCell: `${TABLE_HEADER.padding} ${TABLE_HEADER.firstColumnPadding} ${TABLE_HEADER.text.color} ${TABLE_HEADER.text.size} ${TABLE_HEADER.text.transform} ${TABLE_HEADER.text.tracking}`,
  
  // Get body td classes
  bodyCell: `${TABLE_BODY.cellPadding}`,
  
  // Get body first column classes
  bodyFirstCell: `${TABLE_BODY.firstCellPadding}`,
  
  // Get body actions cell classes
  bodyActionsCell: `${TABLE_BODY.actionsCellPadding}`,
  
  // Get tbody classes
  tbody: `${TABLE_BODY.background} ${TABLE_BODY.divider}`,
  
  // Get tr classes
  row: `${TABLE_BODY.rowHover} ${TABLE_BODY.rowTransition}`,
});

/**
 * DOCUMENTATION
 * 
 * Usage Example:
 * 
 * import { TABLE_PAGINATION, TABLE_HEADER, getTableClasses } from '@/lib/tableConfig';
 * 
 * const classes = getTableClasses();
 * 
 * <Card>
 *   <table>
 *     <thead>
 *       <tr style={{ backgroundColor: TABLE_HEADER.background }}>
 *         <th className={classes.headerFirstCell}>Name</th>
 *         <th className={classes.headerCell}>Email</th>
 *       </tr>
 *     </thead>
 *     <tbody className={classes.tbody}>
 *       <tr className={classes.row}>
 *         <td className={classes.bodyFirstCell}>John Doe</td>
 *         <td className={classes.bodyCell}>john@example.com</td>
 *       </tr>
 *     </tbody>
 *   </table>
 *   
 *   <TablePagination ... />
 * </Card>
 * 
 * NOTE: This configuration ensures all tables throughout the application
 * maintain consistent styling, spacing, and behavior. Any changes to table
 * appearance should be made here to affect all tables globally.
 */
