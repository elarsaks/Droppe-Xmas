import React, { useEffect, useState } from 'react';
import styled from 'styled-components'
import { useDispatch } from "react-redux"
import Product from "./Product"
import { setTotal, setFullPrice } from "../redux/actions"

interface LeftHalfWrapperProps {
  width: string
}

const LeftHalfWrapper = styled.div<LeftHalfWrapperProps>`
  width: ${(p) => p.width};
  padding: 0.3em;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  ::-webkit-scrollbar { 
    width: 0;
    height: 0;
  }
`

interface ShoppingListProps {
  width: string
  initialList
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ width, initialList }) => {

  const getAllProducts = (wishLists: ProductList[]) => {
    let productList: Product[] = []
    wishLists.forEach((i: ProductList) => productList.push(...i.items))
    return productList
  }

  const countSameProducts = (productList: Product[], productId: number) =>
    productList.filter((p) => p.productId === productId).length;

  const mapProductsDataBackToIds = (confirmedProducts: Product[], productsWithAmounts: any) => {
    return productsWithAmounts.map((p: any) =>
      confirmedProducts.filter((cp: Product) => cp.productId === p.productId))
  }

  // Create shoppingList with repeating products merged into single item
  const shoppingList = () => {
    const productList = getAllProducts(initialList)
    const confirmedProducts = productList.filter(product => product.confirmed)
    const uniqueProducts = confirmedProducts.map(item => item.productId)
      .filter((value: number, index: number, self: number[]) => self.indexOf(value) === index)

    // Count repeating products
    const productsWithAmounts = uniqueProducts.map(p => {
      return {
        productId: p,
        amount: countSameProducts(confirmedProducts, p)
      }
    })

    return mapProductsDataBackToIds(confirmedProducts, productsWithAmounts)
  }

  // Get average amount of stars incase there same product from different child
  const getFavoriteAverage = (productList: Product[]) => {
    const favorites = productList.map(p => p.favorite)
    const sum = favorites.reduce((a, c) => a + c)
    return Math.round(sum / favorites.length)
  }

  const getDiscountPercentage = (price: number, amount: number) => {
    if (amount > 1 && amount < 9) {
      return price * amount - (price * amount / 10)
    } else if (amount > 9) {
      return price * amount - (price * 9 / 10)
    } else {
      return price * amount
    }
  }

  // Get price before discount
  const fullPrice = () => {
    const priceList = shoppingList()
      .map((list: Product[]) => list[0].price * list.length)

    return priceList.length > 0
      ? priceList.reduce((acc: number, curr: number) => acc + curr)
      : 0
  }

  // Get price after discount
  const discountedPrice = () => {
    const DiscountedPriceList = shoppingList()
      .map((list: Product[]) =>
        getDiscountPercentage(list[0].price, list.length))

    const discountedPrice = DiscountedPriceList.length > 0
      ? DiscountedPriceList.reduce((acc: number, curr: number) => acc + curr)
      : 0

    return DiscountedPriceList.length === 0
      ? 0
      : discountedPrice
  }

  const productList = shoppingList()
  const dispatch: any = useDispatch()

  useEffect(() => {
    dispatch(setFullPrice(fullPrice()))
    dispatch(setTotal(discountedPrice()))
  }, [fullPrice(), discountedPrice()])

  return (
    <LeftHalfWrapper width={width} className="half">
      <h1 className="half-header">Shopping List</h1>
      {productList.map((product: Product[], i: number) => (
        <Product
          key={i}
          amount={product.length}
          confirmed={product[0].confirmed}
          open={true}
          price={product[0].price}
          title={product[0].title}
          favorite={getFavoriteAverage(product)}
          sendItemToShoppingList={null}
          width={'99%'}
        />
      ))}

    </LeftHalfWrapper>
  )
}