export default interface AuthService {
  getCurrentUser(callback: Function): Promise<firebase.Unsubscribe>;
  login(
    email: string,
    password: string
  ): Promise<{ uid: string; email: string }>;
  logout(): Promise<void>;
  createUser(
    email: string,
    password: string
  ): Promise<{ uid: string; email: string }>;
  checkUserDetails(userInformation: {
    email: string;
    password: string;
    passwordConfirmation: string;
  }): string[];
  verifyPassword(password: string, passwordConfirmation: string): string[];
  verifyEmail(email: string): string[];
}
