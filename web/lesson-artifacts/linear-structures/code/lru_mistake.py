class LRUMistake(LRU):
    def use(self, key):
        if key in self.map:
            self._to_front(self.map[key])   # relinked without unlinking first
            return True
        return super().use(key)
