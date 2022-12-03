import Component from './Component'
import { makeStyle } from '../makeStyle'
import { border } from '../theme'
import colors from '../colors'

interface Tab {
  name: string,
  component: typeof Component
}

export default class Tabs extends Component {
  tabList = document.createElement('div')
  tabContent = document.createElement('div')

  selectedTab!: Tab

  activeComponent!: Component

  private tabElements = new Map<Tab, HTMLElement>()

  constructor (tabs: Tab[]) {
    super()

    this.element.classList.add(containerStyle)

    this.tabList.classList.add(tabListStyle)
    this.element.append(this.tabList)

    this.tabContent.classList.add(tabContentStyle)
    this.element.append(this.tabContent)

    for (const tab of tabs) {
      this.makeTab(tab)
    }
    this.select(tabs[0])
  }

  select (tab: Tab) {
    if (tab === this.selectedTab) {
      return
    }

    for (const tabElement of this.tabElements.values()) {
      tabElement.classList.remove(selectedTabStyle)
    }

    this.tabElements.get(tab)!.classList.add(selectedTabStyle)

    this.activeComponent?.remove()
    this.activeComponent = this.newComponent(tab.component)
    this.tabContent.appendChild(this.activeComponent.element)

    this.selectedTab = tab

    return tab
  }

  private makeTab (tab: Tab) {
    const tabElement = document.createElement('div')
    tabElement.classList.add(tabStyle)
    tabElement.textContent = tab.name
    this.tabList.appendChild(tabElement)
    this.tabElements.set(tab, tabElement)

    tabElement.addEventListener('click', () => {
      this.select(tab)
    })
  }
}

const containerStyle = makeStyle({
  height: `100%`,
  display: `flex`,
  flexDirection: `column`,
})

const tabListStyle = makeStyle({
  display: `flex`,
  borderBottom: border,
})

const tabContentStyle = makeStyle({
  flex: `1 1 0`,
  overflow: `hidden`,
})

const tabStyle = makeStyle({
  padding: `1rem`,
  userSelect: `none`,
})

const selectedTabStyle = makeStyle({
  background: colors.sky[800],
})

makeStyle(`.${tabStyle}:not(:last-child)`, {
  borderRight: border,
})

makeStyle(`.${tabStyle}:hover:not(.${selectedTabStyle})`, {
  background: colors.sky[900] + '88',
})

makeStyle(`.${tabStyle}:active:not(.${selectedTabStyle})`, {
  background: colors.sky[900] + 'aa',
})

