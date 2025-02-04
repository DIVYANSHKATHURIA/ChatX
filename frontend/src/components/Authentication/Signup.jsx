import React, { useState } from "react";
import { Button, Fieldset, Input, Stack } from "@chakra-ui/react";
import { Field } from "../ui/field";
import { PasswordInput } from "../ui/password-input";
import { Toaster, toaster } from "../ui/toaster";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toaster.error({
        title: "Error",
        description: "Passwords do not match",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Store user info and token
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Show success toast
      toaster.success({
        title: "Signup successful",
        description: "Your account has been created successfully!",
      });
    } catch (error) {
      // Show error toast
      toaster.error({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Toaster /> 
      <form onSubmit={handleSubmit}>
        <Fieldset.Root size="lg" maxW="md" color="black">
          <Stack>
            <Fieldset.Legend>Contact Details</Fieldset.Legend>
          </Stack>

          <Fieldset.Content>
            <Field label="Name">
              <Input
                placeholder="Enter your name here"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                border="ridge"
              />
            </Field>

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
            <Field label="Confirm Password">
              <PasswordInput
                placeholder="Confirm your password"
                size="lg"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            Submit
          </Button>
        </Fieldset.Root>
      </form>
    </>
  );
};

export default Signup;
