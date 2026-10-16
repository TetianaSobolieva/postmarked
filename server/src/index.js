import 'dotenv/config';
import express from 'express';

const app = express();

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date() });
})

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
