export function groupStoriesByUser(stories, currentUser) {
  const map = new Map();

  for (const s of stories) {
    const key = String(s.userId || s.username);
    if (!map.has(key)) {
      map.set(key, {
        userId: s.userId,
        username: s.username,
        avatar: s.avatar,
        items: [],
      });
    }
    map.get(key).items.push(s);
  }

  for (const g of map.values()) {
    g.items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  const groups = Array.from(map.values());
  const myId = currentUser?.id;
  const myName = currentUser?.username;

  const isMine = (g) =>
    (myId && g.userId === myId) || (myName && g.username === myName);

  const mine = groups.filter(isMine).map((g) => ({ ...g, isOwn: true }));
  const others = groups.filter((g) => !isMine(g)).map((g) => ({ ...g, isOwn: false }));

  if (mine.length === 0 && currentUser) {
    return [
      {
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        items: [],
        isOwn: true,
      },
      ...others,
    ];
  }

  return [...mine, ...others];
}
