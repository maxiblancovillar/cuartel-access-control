import app from '@/app';

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📚 Docs: http://localhost:${PORT}/health`);
});

export default app;
