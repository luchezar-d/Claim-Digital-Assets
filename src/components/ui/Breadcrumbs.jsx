import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label - The display text
 * @property {string} [href] - The link URL (if not provided, item is not clickable)
 */

/**
 * Breadcrumbs navigation component
 * @param {{ items: BreadcrumbItem[] }} props
 */
export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              {index > 0 && (
                <FiChevronRight 
                  className="h-4 w-4 text-gray-400 mr-2" 
                  aria-hidden="true" 
                />
              )}
              {item.href ? (
                <Link
                  to={item.href}
                  className="text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-500">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
