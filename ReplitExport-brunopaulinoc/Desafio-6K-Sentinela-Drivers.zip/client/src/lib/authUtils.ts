export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    
    if (response.ok) {
      // Reload the page to clear any cached state
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Error during logout:", error);
    // Force reload even if logout fails
    window.location.href = "/";
  }
}