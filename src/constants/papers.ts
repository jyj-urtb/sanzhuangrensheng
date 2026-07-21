/**
 * 纸张素材清单
 * 日记纸(paper) + 卡纸(card)，用于「新建一页」选纸张 & 首页/编辑页显示
 */

// 日记纸（横线纸、牛皮纸、方格纸、稿纸等）
import paper1 from '../assets/paper/paper1.jpg'
import paper2 from '../assets/paper/paper2.jpg'
import paper3 from '../assets/paper/paper3.jpg'
import paper4 from '../assets/paper/paper4.jpg'
import paper5 from '../assets/paper/paper5.jpg'
import paper6 from '../assets/paper/paper6.jpg'
import paper7 from '../assets/paper/paper7.jpg'
import paper8 from '../assets/paper/paper8.jpg'
import paper9 from '../assets/paper/paper9.jpg'
import paper10 from '../assets/paper/paper10.jpg'
import paper11 from '../assets/paper/paper11.jpg'
import paper12 from '../assets/paper/paper12.jpg'

// 卡纸（纯色卡纸）
import card1 from '../assets/card/color1.jpg'
import card2 from '../assets/card/color2.jpg'
import card3 from '../assets/card/color3.jpg'
import card4 from '../assets/card/color4.jpg'
import card5 from '../assets/card/color5.jpg'

export interface PaperItem {
  id: string
  src: string
  type: 'paper' | 'card'
}

export const PAPERS: PaperItem[] = [
  { id: 'paper1', src: paper1, type: 'paper' },
  { id: 'paper2', src: paper2, type: 'paper' },
  { id: 'paper3', src: paper3, type: 'paper' },
  { id: 'paper4', src: paper4, type: 'paper' },
  { id: 'paper5', src: paper5, type: 'paper' },
  { id: 'paper6', src: paper6, type: 'paper' },
  { id: 'paper7', src: paper7, type: 'paper' },
  { id: 'paper8', src: paper8, type: 'paper' },
  { id: 'paper9', src: paper9, type: 'paper' },
  { id: 'paper10', src: paper10, type: 'paper' },
  { id: 'paper11', src: paper11, type: 'paper' },
  { id: 'paper12', src: paper12, type: 'paper' }
]

export const CARDS: PaperItem[] = [
  { id: 'card1', src: card1, type: 'card' },
  { id: 'card2', src: card2, type: 'card' },
  { id: 'card3', src: card3, type: 'card' },
  { id: 'card4', src: card4, type: 'card' },
  { id: 'card5', src: card5, type: 'card' }
]

export const ALL_PAPERS = [...PAPERS, ...CARDS]

export function getPaperById(id: string): PaperItem | undefined {
  return ALL_PAPERS.find(p => p.id === id)
}
