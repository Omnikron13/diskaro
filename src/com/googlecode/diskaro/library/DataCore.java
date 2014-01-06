/**
 * 
 */
package com.googlecode.diskaro.library;

/**
 * @author S4T4N
 * Core logic & structure shared by all objects that represent database entries
 * that have an id & name.
 */
public abstract class DataCore {
	//Internal database uid
	protected int id;
	//Human readable name
	protected String name;
	
	/**
	 * Return the UID used by the library database.
	 * @return the UID
	 */
	public int getID() {
		return this.id;
	}
	
	/**
	 * Return the human-readable name.
	 * @return the name
	 */
	public String getName() {
		return this.name;
	}
	
	/**
	 * @see getName()
	 */
	public String toString() {
		return getName();
	}
	
	/**
	 * DataCore objects are compared by both their specific subclass and their uid
	 */
	public boolean equals(Object obj) {
		if(this.getClass() != obj.getClass()) {
			return false;
		}
		DataCore dc = (DataCore) obj;
		if(id == dc.getID()) {
			return true;
		}
		return false;
	}
	
	/**
	 * DataCore hash codes are merely their uid
	 */
	public int hashCode() {
		return id;
	}
}
