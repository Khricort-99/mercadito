import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase.js'

const PRODUCTS_COLLECTION = 'products'
const BATCH_LIMIT = 400

const productsCollection = collection(db, PRODUCTS_COLLECTION)

function toProduct(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

export async function fetchProducts() {
  const snapshot = await getDocs(productsCollection)
  return snapshot.docs.map(toProduct)
}

export function subscribeProducts(onNext, onError) {
  return onSnapshot(
    productsCollection,
    (snapshot) => onNext(snapshot.docs.map(toProduct)),
    onError
  )
}

export async function fetchProduct(id) {
  const snapshot = await getDoc(doc(db, PRODUCTS_COLLECTION, id))
  return snapshot.exists() ? toProduct(snapshot) : null
}

export async function saveProduct(product) {
  await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product)
  return product
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id))
}

export async function hasProducts() {
  const snapshot = await getDocs(query(productsCollection, limit(1)))
  return !snapshot.empty
}

export async function saveProducts(products) {
  for (let index = 0; index < products.length; index += BATCH_LIMIT) {
    const batch = writeBatch(db)
    for (const product of products.slice(index, index + BATCH_LIMIT)) {
      batch.set(doc(db, PRODUCTS_COLLECTION, product.id), product)
    }
    await batch.commit()
  }
  return products.length
}
