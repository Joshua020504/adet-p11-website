import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode }from 'jwt-decode';
import { 
    Navbar, Nav, NavDropdown, Container, Row, Col, Button, 
    Modal, Form, Table
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import { API_ENDPOINT } from './Api';

function Logbook() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [showRead, setShowRead] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form, setForm] = useState({ fullname: '', email: '', passwords: '' });
    const [validationError, setValidationError] = useState({});

    const navigate = useNavigate();
    const token = JSON.parse(localStorage.getItem('token'))?.data?.token;
    const headers = { Authorization: token };

    useEffect(() => {
        const fetchUser = () => {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch {
                navigate('/login');
            }
        };
        fetchUser();
        fetchUsers();
    }, [token, navigate]);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get(`${API_ENDPOINT}/user`, { headers });
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        navigate('/login');
    };

    const handleShowCreate = () => {
        setForm({ fullname: '', email: '', passwords: '' });
        setShowCreate(true);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_ENDPOINT}/user`, form, { headers });
            Swal.fire('Success', 'User created successfully', 'success');
            fetchUsers();
            setShowCreate(false);
        } catch (error) {
            if (error.response?.status === 422) {
                setValidationError(error.response.data.errors);
            } else {
                Swal.fire('Error', error.response?.data?.message || 'An error occurred', 'error');
            }
        }
    };

    const handleShowRead = (user) => {
        setSelectedUser(user);
        setShowRead(true);
    };

    const handleShowUpdate = (user) => {
        console.log('User for update:', user);
        setForm({ fullname: user.fullname, email: user.email, passwords: user.password || '' });
        setSelectedUser(user);
        setShowUpdate(true);
    };
    
    const handleUpdate = async (e) => {
        e.preventDefault();
        console.log('Form data being sent:', form);
        try {
            await axios.put(`${API_ENDPOINT}/user/${selectedUser.id}`, form, { headers });
            Swal.fire('Success', 'User updated successfully', 'success');
            fetchUsers();
            setShowUpdate(false);
        } catch (error) {
            console.error('Error during update:', error.response || error.message);
            if (error.response?.status === 422) {
                setValidationError(error.response.data.errors);
            } else {
                Swal.fire('Error', error.response?.data?.message || 'An error occurred', 'error');
            }
        }
    };
    
    
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'blue',
            cancelButtonColor: 'red',
            confirmButtonText: 'Yes, delete it!'
        });

        if (confirm.isConfirmed) {
            try {
                await axios.delete(`${API_ENDPOINT}/user/${id}`, { headers });
                Swal.fire('Deleted!', 'User has been deleted.', 'success');
                fetchUsers();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'An error occurred', 'error');
            }
        }
    };

    return (
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/dashboard">Carhartt</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/Shirts">Shirts</Nav.Link>
                            <Nav.Link as={Link} to="/Shorts & Jackets">Shorts & Jacket</Nav.Link>
                            <Nav.Link as={Link} to="/Pants">Pants</Nav.Link>
                        </Nav>
                        <Nav className="ms-auto">
                            <NavDropdown title={user?.username || 'User'} id="basic-nav-dropdown">
                                <NavDropdown.Item href="#">Profile</NavDropdown.Item>
                                <NavDropdown.Item href="#">Settings</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container>
                <Row>
                    <Col>
                        <h1 className="text-center mt-4">The Record Book</h1>
                        <Button variant="success" className="mb-2 float-end" onClick={handleShowCreate}>Create User</Button>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Email</th>
                                    <th>Fullname</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                     <tr key={user.id}>
                                     <td>{user.id}</td>
                                     <td>{user.email}</td> {/* Updated */}
                                     <td>{user.fullname}</td>
                                     <td>
                                     <Button variant="secondary" size="sm" onClick={() => handleShowRead(user)}>Read</Button>{' '}
                                     <Button variant="warning" size="sm" onClick={() => handleShowUpdate(user)}>Update</Button>{' '}
                                     <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>Delete</Button>
                                    </td>
                                  </tr>
                                 ))}
                           </tbody>

                        </Table>
                    </Col>
                </Row>
            </Container>

            {/* Modals */}
            <Modal show={showCreate} onHide={() => setShowCreate(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreate}>
                        <Form.Group controlId="fullname">
                            <Form.Label>Fullname</Form.Label>
                            <Form.Control
                                type="text"
                                value={form.fullname}
                                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="text"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="passwords">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={form.passwords}
                                onChange={(e) => setForm({ ...form, passwords: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">Save</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showRead} onHide={() => setShowRead(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser ? (
                        <div>
                            <p><strong>ID:</strong> {selectedUser.id}</p>
                            <p><strong>Fullname:</strong> {selectedUser.fullname}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                        </div>
                    ) : (
                        <p>No user selected</p>
                    )}
                </Modal.Body>
            </Modal>

            <Modal show={showUpdate} onHide={() => setShowUpdate(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdate}>
                        <Form.Group controlId="fullname">
                            <Form.Label>Fullname</Form.Label>
                            <Form.Control
                                type="text"
                                value={form.fullname}
                                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="text"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="passwords">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={form.passwords}
                                onChange={(e) => setForm({ ...form, passwords: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">Update</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Logbook;