import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, ReactNode } from "react";
import styled from "styled-components";
import NotificationControls from "./NotificationControls";
import ForegroundMessageHandler, { NotificationToasts } from "./ForegroundMessageHandler";

interface LayoutProps {
  children: ReactNode;
}

interface User {
  username: string;
}

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 1000;

  @media (min-width: 769px) {
    padding: 1rem 2rem;
  }
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (min-width: 769px) {
    gap: 2rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.2rem;
  font-weight: bold;
  color: #111827;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: fit-content;
  white-space: nowrap;

  @media (min-width: 769px) {
    font-size: 1.5rem;
  }

  &:hover {
    opacity: 0.8;
  }
`;

const HamburgerBtn = styled.button`
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #111827;

  @media (min-width: 769px) {
    display: none;
  }

  span {
    width: 25px;
    height: 3px;
    background: #111827;
    border-radius: 2px;
    transition: all 0.3s ease;
    display: block;
  }

  &.open span:nth-child(1) {
    transform: rotate(45deg) translate(10px, 10px);
  }

  &.open span:nth-child(2) {
    opacity: 0;
  }

  &.open span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -7px);
  }
`;

const NavLinks = styled.div<{ $isOpen?: boolean }>`
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  flex-direction: column;
  gap: 1rem;
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 999;

  a {
    color: #374151;
    text-decoration: none;
    font-weight: 500;
    padding: 0.75rem;
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
      background: #f3f4f6;
      color: #111827;
    }
  }

  @media (min-width: 769px) {
    display: flex !important;
    position: static;
    flex-direction: row;
    gap: 2rem;
    padding: 0;
    background: none;
    box-shadow: none;
    border-bottom: none;
    flex: 1;

    a {
      color: #4b5563;
      padding: 0;
      border-radius: 0;

      &:hover {
        background: none;
        color: #111827;
      }
    }
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
  font-size: 0.9rem;

  @media (min-width: 769px) {
    gap: 1.5rem;
    font-size: 1rem;
  }
`;

const LogoutBtn = styled.button`
  background: #4b5563;
  color: white;
  border: 1px solid #4b5563;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  min-height: 44px;

  @media (min-width: 769px) {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  &:hover {
    background: #3f4655;
    border-color: #3f4655;
  }
`;

const Container = styled.div`
  margin-top: 70px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 70px);
`;

const Main = styled.main`
  flex: 1;
  padding: 1rem;
  width: 100%;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Footer = styled.footer`
  background: #f8f9fa;
  border-top: 1px solid #eee;
  padding: 1.5rem;
  text-align: center;
  color: #666;
  margin-top: auto;

  p {
    margin: 0;
    font-size: 0.85rem;
  }

  @media (min-width: 768px) {
    padding: 2rem;

    p {
      font-size: 0.9rem;
    }
  }
`;

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [router.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  if (isLoading) return null;

  // Don't show layout on auth pages
  if (router.pathname === "/login" || router.pathname === "/register") {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <ForegroundMessageHandler />
      <NotificationToasts />
      <Navbar>
        <NavContent>
          <HamburgerBtn
            className={isMenuOpen ? "open" : ""}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </HamburgerBtn>
          <Logo href="/dashboard">📦 Warehouse</Logo>
          <NavLinks $isOpen={isMenuOpen}>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/pallets">Pallets</Link>
            <Link href="/items">Items</Link>
            <Link href="/owners">Owners</Link>
            <Link href="/lots">Lots</Link>
          </NavLinks>

          <NotificationControls />

          <UserMenu>
            <span>{user.username}</span>
            <LogoutBtn onClick={handleLogout}>Logout</LogoutBtn>
          </UserMenu>
        </NavContent>
      </Navbar>

      <Container>
        <Main>{children}</Main>

        <Footer>
          <p>© 2026 Warehouse Inventory System</p>
        </Footer>
      </Container>
    </>
  );
}
