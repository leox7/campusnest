// LOGIN
export const login = (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
  
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
  
        if (results.length === 0) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
  
        const user = results[0];
  
        const isMatch = await bcrypt.compare(password, user.password);
  
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
        }
  
        // Generate token
        const token = jwt.sign(
          {
            id: user.id,
            role: user.user_role,
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );
  
        res.status(200).json({
          message: "Login successful",
          token,
        });
      }
    );
  };
  