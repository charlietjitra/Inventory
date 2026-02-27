import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authAPI, api } from "@/lib/api";
import { requestNotificationPermission } from "@/config/firebaseConfig";
import {
  Title,
  FormGroup,
  Label,
  StyledInput,
  StyledButton,
  ErrorMessage,
} from "@/styles/styledComponents";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  padding: 2rem;
`;

const FormWrapper = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  width: 100%;
  max-width: 400px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Footer = styled.p`
  text-aligb7280;
  margin-top: 1.5rem;

  a {
    color: #4b5563
    color: #667eea;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorText = styled.div`
  flex: 1;
`;

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      const { user, token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Request notification permission after successful login
      try {
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          // Save FCM token to backend
          await api.post('/notifications/fcm-token', { token: fcmToken });
          console.log('Notifications enabled after login');
        }
      } catch (notifError) {
        console.warn('Could not enable notifications:', notifError);
        // Don't block login flow if notifications fail
      }

      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please try again.";

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await handleLogin();
  };

  return (
    <Container>
      <FormWrapper>
        <Title>Login</Title>

        {error && (
          <ErrorMessage>
            <ErrorText>{error}</ErrorText>
          </ErrorMessage>
        )}

        <Form onSubmit={handleFormSubmit}>
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <StyledInput
              id="username"
              type="text"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              required
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <StyledInput
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
              disabled={loading}
            />
          </FormGroup>

          <StyledButton type="button" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </StyledButton>
        </Form>

        <Footer>
          Don't have an account? <Link href="/register">Register</Link>
        </Footer>
      </FormWrapper>
    </Container>
  );
}
