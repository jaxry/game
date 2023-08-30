import Component from './Component'
import { addStyle, makeStyle } from '../makeStyle'
import { border } from '../theme'
import colors from '../colors'
import { createDiv } from '../createElement'

interface Tab {
  name: string,
  component: typeof Component<HTMLElement>
}

export default class Tabs extends Component {
  tabList = createDiv(this.element, tabListStyle)
  tabContent = createDiv(this.element, tabContentStyle)

  selectedTab!: Tab

  activeComponent!: Component

  private tabElements = new Map<Tab, HTMLElement>()

  constructor (public tabs: Tab[]) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)

    for (const tab of this.tabs) {
      this.makeTab(tab)
    }
    this.select(this.tabs[0])
  }

  select (tab: Tab) {
    if (tab === this.selectedTab) return

    for (const tabElement of this.tabElements.values()) {
      tabElement.classList.remove(selectedTabStyle)
    }

    this.tabElements.get(tab)!.classList.add(selectedTabStyle)

    this.activeComponent?.remove()
    this.activeComponent =
        this.newComponent(tab.component).appendTo(this.tabContent)

    this.selectedTab = tab

    return tab
  }

  private makeTab (tab: Tab) {
    const tabElement = createDiv(this.tabList, tabStyle, tab.name)
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

addStyle(`.${tabStyle}:not(:last-child)`, {
  borderRight: border,
})

addStyle(`.${tabStyle}:hover:not(.${selectedTabStyle})`, {
  background: colors.sky[900] + '88',
})

addStyle(`.${tabStyle}:active:not(.${selectedTabStyle})`, {
  background: colors.sky[900] + 'aa',
})

