exports.health = (req, res) => {
  try {
    res.sendStatus(200).json()
  } catch (err) {
    res.sendStatus(404).json({ message: '404 not found' })
  }
}
