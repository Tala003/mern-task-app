# 1️⃣ Use lightweight Node image
FROM node:18-alpine

# 2️⃣ Set working directory inside container
WORKDIR /app

# 3️⃣ Copy only package files first (for caching)
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm install --only=production

# 5️⃣ Copy application source code
COPY . .

# 6️⃣ Expose application port
EXPOSE 4001

# 7️⃣ Start the service
CMD ["node", "src/app.js"]
