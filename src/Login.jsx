import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.css';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { jwtDecode } from 'jwt-decode';
import { API_ENDPOINT } from './Api';


function Login() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchUser = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedUser = jwtDecode(token);
          setUser(decodedUser);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error verifying user session:', error);
        localStorage.removeItem('token');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_ENDPOINT}/auth/login`, {
        username,
        passwords: password, 
      });
      localStorage.setItem('token', JSON.stringify(response));
      setError('');
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <Row className="justify-content-md-center">
        <Col md={4}>
          <div className="login-form">
            <div className="container text-center">
              <div className="login-logo mb-4">
                <img src="/paradiesemo.gif" width="15%" alt="logo" />
              </div>
              <h3 className="mb-4">PARA-DIES</h3>
              <div className="card">
                <div className="card-body login-card-body">
                  <form onSubmit={handleSubmit}>
                    <Form.Group controlId="formUsername" className="mb-3">
                      <Form.Label>Username:</Form.Label>
                      <Form.Control
                        className="form-control-sm rounded-0"
                        type="text"
                        placeholder="Enter Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formPassword" className="mb-3">
                      <Form.Label>Password:</Form.Label>
                      <Form.Control
                        className="form-control-sm rounded-0"
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </Form.Group>

                    {error && <p className="text-danger mb-3">{error}</p>}

                    <Form.Group controlId="formButton" className="d-grid gap-2">
                      <Button
                        variant="dark"
                        className="btn btn-block bg-custom btn-flat rounded-0"
                        size="lg"
                        type="submit"
                      >
                        Login Now
                      </Button>
                    </Form.Group>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;