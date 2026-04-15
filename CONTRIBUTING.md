# 🏆 Best Practices & Guidelines

## Code Style

### TypeScript
- Use strict mode (`tsconfig.json`)
- Always type props interfaces
- Avoid `any` type - use generics or union types
- Use `satisfies` for type checking complex objects

### React Components
- Use functional components with hooks
- Keep components small and focused (<200 lines)
- Extract custom hooks for reusable logic
- Use React.memo for expensive components

### Naming Conventions
```typescript
// Components (PascalCase)
export function GameCard({ game }: Props) {}

// Functions (camelCase)
export async function fetchGames() {}

// Constants (SCREAMING_SNAKE_CASE)
const MAX_GAMES_PER_PAGE = 20;

// Variables (camelCase)
const currentStatus = 'Playing';
```

## File Structure

```
src/
├── app/          # Next.js app router pages
├── components/   # Reusable React components
├── lib/         # Utilities, API clients, types
└── styles/      # Global styles

components/
├── GameCard.tsx
├── GameCard3D.tsx
├── index.ts     # Central export point
└── ...
```

## Performance Guidelines

1. **Image Optimization**
   ```typescript
   // Always use next/image for remote images
   <Image src={url} alt="..." fill className="object-cover" />
   ```

2. **Code Splitting**
   ```typescript
   // Use dynamic imports for large components
   const DetailedRatingModal = dynamic(() => import('./DetailedRatingModal'));
   ```

3. **Memoization**
   ```typescript
   // Memoize expensive components
   export const GameCard = memo(function GameCard({ game }) {
     return <div>...</div>;
   });
   ```

## Error Handling

### API Calls
```typescript
try {
  const data = await fetchGames();
  setGames(data);
} catch (error) {
  console.error('Failed to fetch games:', error);
  setError('User-friendly message');
} finally {
  setIsLoading(false);
}
```

### Component Errors
```typescript
// Use ErrorBoundary for graceful degradation
<ErrorBoundary fallback={<ErrorUI />}>
  <GameList />
</ErrorBoundary>
```

## Testing Strategy

### Unit Tests
- Test utility functions and hooks
- Mock external dependencies
- Test error cases

### Integration Tests
- Test component interactions
- Test API integration
- Test user workflows

### E2E Tests
- Test critical user flows
- Test across browsers
- Test responsive design

## Database Guidelines

1. **Always use migrations for schema changes**
2. **Add indexes for frequently queried columns**
3. **Use transactions for related updates**
4. **Document RLS policies clearly**

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optional
NEXT_PUBLIC_RAWG_API_KEY=
```

Never commit `.env.local` - use `.env.example` instead.

## Git Workflow

1. Create feature branch: `git checkout -b feature/game-logos`
2. Make atomic commits: `git commit -m "feat: add game logos"`
3. Push and create pull request: `git push origin feature/game-logos`
4. Squash and merge on main

### Commit Format
```
feat: add feature description
fix: fix bug description
docs: documentation updates
refactor: code restructuring
perf: performance improvements
test: test additions/updates
chore: build/config changes
```

## Deployment Checklist

- [ ] All tests passing locally
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Code reviewed
- [ ] Performance metrics checked
- [ ] Security audit passed
- [ ] Lighthouse score >90

## Common Pitfalls to Avoid

1. **❌ Using `index` as key in lists**
   ```typescript
   // Bad
   {items.map((item, index) => <div key={index}>{...}</div>)}
   
   // Good
   {items.map((item) => <div key={item.id}>{...}</div>)}
   ```

2. **❌ Mutating state directly**
   ```typescript
   // Bad
   games[0].title = 'New Title';
   
   // Good
   setGames(games.map(g => g.id === games[0].id ? {...g, title: 'New Title'} : g));
   ```

3. **❌ Missing dependencies in useEffect**
   ```typescript
   // Bad
   useEffect(() => {
     fetchGames(id);
   }, []); // Missing 'id'
   
   // Good
   useEffect(() => {
     fetchGames(id);
   }, [id]);
   ```

4. **❌ Not handling loading states**
   ```typescript
   // Good - always show feedback
   {isLoading && <Loader />}
   {error && <ErrorMessage />}
   {data && <GameList />}
   ```

## Code Review Checklist

- [ ] Types are correct and complete
- [ ] Error handling is present
- [ ] Performance implications considered
- [ ] No console errors/warnings
- [ ] Code is readable and maintainable
- [ ] Tests added/updated if needed
- [ ] Documentation updated
- [ ] No hardcoded values

## Security Checklist

- [ ] No sensitive data in code
- [ ] Input validation implemented
- [ ] SQL injection prevention (Supabase handles this)
- [ ] XSS prevention (React handles this)
- [ ] CORS configured correctly
- [ ] Rate limiting considered
- [ ] Dependencies kept up to date

---

**Remember**: Write code as if someone else will maintain it. Be clear, be consistent, be kind to your future self.
