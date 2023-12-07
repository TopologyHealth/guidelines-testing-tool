import { StylesProvider } from "@material-ui/core";
import styles from "../../../styles/Home.module.css";

// Function for paginating items
export const paginate = (items, pageNumber, pageSize) => {
  const startIndex = (pageNumber - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
};

const Pagination = ({ items, pageSize, currentPage, onPageChange }) => {
  const pageCount = Math.ceil(items / pageSize);

  // If only one page, don't show pagination
  if (pageCount === 1) {
    return null;
  }

  // create array of pages
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div>
      <ul className={styles.pagination}>
        {pages.map((page) => (
          <li
            key={page}
            className={
              page === currentPage ? styles.pageItemActive : styles.pageItem
            }
            onClick={() => onPageChange(page)}
          >
            <a className={styles.pageLink}>{page}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pagination;
