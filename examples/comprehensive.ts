import {
  safe,
  Array,
  Map,
  Queue,
  Set,
  Result,
  Option,
  fn,
  AsyncResult,
  OptionMonad,
  ResultMonad,
} from "../src";

// User domain example
type UserId = string;
type UserData = {
  id: UserId;
  name: string;
  age: number;
  email: Option<string>;
};

// In-memory user repository
class UserRepository {
  private users: Map<UserId, UserData>;

  constructor() {
    this.users = Map.empty<UserId, UserData>();
  }

  create(data: Omit<UserData, "id">): Result<UserData, string> {
    const id = `user_${Date.now()}`;
    const user: UserData = {
      id,
      name: data.name,
      age: data.age,
      email: data.email,
    };

    this.users = this.users.set(id, user);
    return { kind: "ok", value: user };
  }

  findById(id: UserId): Option<UserData> {
    return this.users.get(id);
  }

  update(
    id: UserId,
    data: Partial<Omit<UserData, "id">>,
  ): Result<UserData, string> {
    const userOption = this.users.get(id);

    if (userOption.kind === "none") {
      return { kind: "error", error: "user_not_found" };
    }

    const user = userOption.value;
    const updatedUser: UserData = {
      ...user,
      ...data,
      id, // ensure id doesn't change
    };

    this.users = this.users.set(id, updatedUser);
    return { kind: "ok", value: updatedUser };
  }

  delete(id: UserId): Result<void, string> {
    const userExists = this.users.get(id).kind === "some";

    if (!userExists) {
      return { kind: "error", error: "user_not_found" };
    }

    this.users = this.users.delete(id);
    return { kind: "ok", value: undefined };
  }

  list(): Array<UserData> {
    return this.users.values();
  }
}

// User service with validation and business logic
class UserService {
  constructor(private repository: UserRepository) {}

  validateUser(data: any): Result<Omit<UserData, "id">, string> {
    // Validate name
    if (typeof data.name !== "string" || data.name.trim() === "") {
      return { kind: "error", error: "invalid_name" };
    }

    // Validate age
    if (typeof data.age !== "number" || data.age < 0 || data.age > 120) {
      return { kind: "error", error: "invalid_age" };
    }

    // Validate email (optional)
    let email: Option<string> = { kind: "none" };
    if (data.email !== undefined) {
      if (typeof data.email !== "string" || !data.email.includes("@")) {
        return { kind: "error", error: "invalid_email" };
      }
      email = { kind: "some", value: data.email };
    }

    return {
      kind: "ok",
      value: {
        name: data.name,
        age: data.age,
        email,
      },
    };
  }

  async createUser(userData: any): Promise<Result<UserData, string>> {
    // First validate the user data
    const validationResult = this.validateUser(userData);

    // If validation fails, return the error
    if (validationResult.kind === "error") {
      return validationResult;
    }

    // Create the user (now we're sure validation passed)
    try {
      return this.repository.create(validationResult.value);
    } catch (error) {
      return { kind: "error", error: String(error) };
    }
  }

  async updateUser(
    id: string,
    userData: any,
  ): Promise<Result<UserData, string>> {
    // First check if user exists
    const userOption = this.repository.findById(id);

    if (userOption.kind === "none") {
      return { kind: "error", error: "user_not_found" };
    }

    // Validate only the provided fields
    const updateData: Partial<Omit<UserData, "id">> = {};

    if (userData.name !== undefined) {
      if (typeof userData.name !== "string" || userData.name.trim() === "") {
        return { kind: "error", error: "invalid_name" };
      }
      updateData.name = userData.name;
    }

    if (userData.age !== undefined) {
      if (
        typeof userData.age !== "number" ||
        userData.age < 0 ||
        userData.age > 120
      ) {
        return { kind: "error", error: "invalid_age" };
      }
      updateData.age = userData.age;
    }

    if (userData.email !== undefined) {
      if (userData.email === null) {
        updateData.email = { kind: "none" };
      } else {
        if (
          typeof userData.email !== "string" ||
          !userData.email.includes("@")
        ) {
          return { kind: "error", error: "invalid_email" };
        }
        updateData.email = { kind: "some", value: userData.email };
      }
    }

    // Perform the update
    try {
      return this.repository.update(id, updateData);
    } catch (error) {
      return { kind: "error", error: String(error) };
    }
  }

  async getUserById(id: string): Promise<Option<UserData>> {
    // Simulate async operation
    return await Promise.resolve(this.repository.findById(id));
  }

  async listUsers(): Promise<Array<UserData>> {
    // Simulate async operation
    return await Promise.resolve(this.repository.list());
  }
}

// Usage example
async function main() {
  const repository = new UserRepository();
  const userService = new UserService(repository);

  // Create users
  const alice = await userService.createUser({
    name: "Alice",
    age: 30,
    email: "alice@example.com",
  });

  const bob = await userService.createUser({
    name: "Bob",
    age: 25,
  });

  // Invalid user
  const invalid = await userService.createUser({
    name: "Invalid",
    age: -5,
  });

  console.log("Create results:");
  console.log("Alice:", JSON.stringify(alice));
  console.log("Bob:", JSON.stringify(bob));
  console.log("Invalid:", JSON.stringify(invalid));

  // Update user
  if (alice.kind === "ok") {
    const updated = await userService.updateUser(alice.value.id, {
      age: 31,
      email: null, // remove email
    });

    console.log("Updated Alice:", JSON.stringify(updated));
  }

  // List all users
  const users = await userService.listUsers();
  console.log("All users:");
  users.to_array().forEach((user) => {
    console.log(
      `- ${user.name}, ${user.age}, Email: ${user.email.kind === "some" ? user.email.value : "none"}`,
    );
  });
}

main().catch(console.error);
