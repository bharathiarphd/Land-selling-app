import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import { Button } from './Button';
import styles from './SearchBar.module.css';

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: () => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className = '', onSearch, ...props }, ref) => {
    return (
      <div className={`${styles.searchBar} ${className}`}>
        <Search className={styles.icon} size={20} />
        <input 
          ref={ref}
          type="text" 
          className={styles.input} 
          placeholder="Search by location, village, town or district..."
          {...props} 
        />
        <Button size="sm" onClick={onSearch}>Search</Button>
      </div>
    );
  }
);
SearchBar.displayName = 'SearchBar';
