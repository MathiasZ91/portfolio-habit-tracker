import { Link } from 'react-router';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Daily Habits</Link>
        </li>
        <li>
          <Link to="/calendar">Calendar</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;