import React, { useState } from "react";
import { Button, Fieldset, Input, Stack } from "@chakra-ui/react";
import { Field } from "../ui/field";
import { PasswordInput } from "../ui/password-input";
import { Toaster, toaster } from "../ui/toaster"; 
import { useNavigate } from "react-router-dom";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store user info and token
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Show success toast
      toaster.success({
        title: "Login successful",
        description: "Welcome back!",
      });

      // Redirect to chats page after login
      navigate("/chats");
    } catch (error) {
      // Show error toast
      toaster.error({
        title: "Error",
        description: error.message || "Invalid email or password",
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Toaster /> {/* Ensure Toaster component is rendered */}
      <form onSubmit={handleSubmit}>
        <Fieldset.Root size="lg" maxW="md" color="black">
          <Stack>
            <Fieldset.Legend>Login</Fieldset.Legend>
          </Stack>

          <Fieldset.Content>
            <Field label="Email address">
              <Input
                placeholder="Enter your email address here"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                border="ridge"
              />
            </Field>

            <Field label="Password">
              <PasswordInput
                placeholder="Enter your password"
                size="lg"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                border="ridge"
              />
            </Field>
          </Fieldset.Content>

          <Button
            mt="1px"
            colorScheme="blue"
            type="submit"
            alignSelf="flex-start"
            isLoading={loading}
            backgroundColor="blue.500"
            borderRadius="10px"
            marginTop="10px"
            _hover={{ backgroundColor: "blue.600" }}
          >
            Login
          </Button>
        </Fieldset.Root>
      </form>
    </>
  );
};

export default Login;
