import { Router } from 'express'

const router = Router();

router.get('/user', (req, res) => {
    res.send("heeloo");
})

export default router;