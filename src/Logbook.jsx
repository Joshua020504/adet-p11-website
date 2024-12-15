import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
    Navbar, Nav, NavDropdown, Container, Row, Col, Button, 
    Modal, Form, Table, Card
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
    const [form, setForm] = useState({ fullname: '', username: '', passwords: '' });
    const [validationError, setValidationError] = useState({});

    const navigate = useNavigate();
    const token = JSON.parse(localStorage.getItem('token'))?.data?.token;
    const headers = { Authorization: token }; // Use backticks for string interpolation

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
        setForm({ fullname: '', username: '', passwords: '' });
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
        setForm({ fullname: user.fullname, username: user.username, passwords: user.password || '' });
        setSelectedUser(user);
        setShowUpdate(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const payload = { 
            fullname: form.fullname, 
            username: form.username 
        };
        if (form.passwords) payload.passwords = form.passwords; // Include password only if provided

        try {
            await axios.put(`${API_ENDPOINT}/user/${selectedUser.id}`, payload, { headers });
            Swal.fire('Success', 'User updated successfully', 'success');
            fetchUsers();
            setShowUpdate(false);
        } catch (error) {
            console.error('Error during update:', error.response?.data || error.message);
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
            {/* Navbar */}
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-uppercase">
                        <i className="bi bi-book"></i> PARA-DIES Record Book
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <NavDropdown title={users[0]?.username || 'User'} id="basic-nav-dropdown">
                                <NavDropdown.Item href="#">Profile</NavDropdown.Item>
                                <NavDropdown.Item href="#">Settings</NavDropdown.Item>
                                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Main Content */}
            <Container>
                <Row>
                    <Col>
                        <h1 className="text-center mt-4">The Record Book</h1>
                        <Button variant="success" className="mb-2 float-end" onClick={handleShowCreate}>
                            Create User
                        </Button>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Fullname</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.username}</td>
                                        <td>{user.fullname}</td>
                                        <td className="text-center">
                                                    <Button variant="secondary" size="sm" className="me-2" onClick={() => handleShowRead(user)}>
                                                        <i className="bi bi-eye"></i>
                                                    </Button>
                                                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowUpdate(user)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </Button>
                                                    <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
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
                        <Form.Group className="mb-3" controlId="fullname">
                            <Form.Label>Fullname</Form.Label>
                            <Form.Control
                                type="text"
                                value={form.fullname}
                                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                                placeholder="Enter full name"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="username"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                placeholder="Enter username"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="passwords">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={form.passwords}
                                onChange={(e) => setForm({ ...form, passwords: e.target.value })}
                                placeholder="Enter password"
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">Save</Button>
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
                            <p><strong>Username:</strong> {selectedUser.username}</p>
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
                        <Form.Group className="mb-3" controlId="fullname">
                            <Form.Label>Fullname</Form.Label>
                            <Form.Control
                                type="text"
                                value={form.fullname}
                                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="username"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="passwords">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={form.passwords}
                                onChange={(e) => setForm({ ...form, passwords: e.target.value })}
                                placeholder="Leave blank to keep the current password"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">Update</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Logbook;