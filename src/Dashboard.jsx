import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { jwtDecode } from 'jwt-decode';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error('Failed to verify session:', error);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const cardsData = [
    { image: 'evisu 1.jpg', title: 'Evisu Premium Shirt', description: 'Discover the premium style of Evisu shirts.' },
    { image: 'evisu 2.jpg', title: 'Evisu Lit Jacket', description: 'Step out in iconic Evisu jeans for any occasion.' },
    { image: 'evisu 3.jpg', title: 'Evisu x Affliction', description: 'Stay warm and stylish with Evisu jackets.' },
    { image: 'evisu 4.jpg', title: 'Evisu Lit Shirt', description: 'Experience comfort and quality with Evisu shorts.' },
    { image: 'evisu 5.jpg', title: 'Evisu Graphic Tee', description: 'Show off bold designs with Evisu graphic t-shirts.' },
    { image: 'evisu 6.jpg', title: 'Evisu Denim Jeans', description: 'Upgrade your wardrobe with Evisu’s signature denim.' },
    { image: 'evisu 7.jpg', title: 'Evisu Hoodie', description: 'Stay cozy with Evisu’s premium hoodies, perfect for any weather.' },
    { image: 'evisu 8.jpg', title: 'Evisu Classic Cap', description: 'Complete your outfit with an Evisu classic cap.' },
    { image: 'evisu 9.jpg', title: 'Evisu Slides', description: 'Relax in comfort and style with Evisu branded slides.' },
];

  return (
    <>
      <Navbar expand="lg" style={{ backgroundColor: '#343a40', padding: '10px' }}>
        <Container>
          <Navbar.Brand as={Link} to="/dashboard" style={{ color: '#fff', fontWeight: 'bold' }}>PARA-DIES</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard/logbook" style={{ color: '#fff' }}>Logbook</Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              <NavDropdown title={user?.username || 'Account'} id="basic-nav-dropdown" align="end">
                <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <h2 className="mt-4">WELCOME PARA-DIES APPAREL, {user ? user.username : 'Guest'}!</h2>
        <Row>
          {cardsData.map((card, index) => (
            <Col md={4} key={index} className="mb-4">
              <Card>
                <Card.Img variant="top" src={card.image} alt={card.title} />
                <Card.Body>
                  <Card.Title>{card.title}</Card.Title>
                  <Card.Text>{card.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}

export default Dashboard;
